import type { Data, DataPath } from "../../util/data.js";
import type { Identifier } from "../../util/item.js";
import type { QueryFilter } from "../../util/query.js";
import type { Update } from "../../util/update.js";
import { type SQLFragment, SQLProvider } from "./SQLProvider.js";

/** Abstract PostgreSQL provider with JSONB function support for nested keys, array containment, and array mutations. */
export abstract class PostgreSQLProvider<I extends Identifier = Identifier, T extends Data = Data> extends SQLProvider<I, T> {
	/** Get the Postgres JSONB path for the nested segments of a key, e.g. `{"b","c"}`. */
	private sqlPath(key: DataPath): SQLFragment {
		return this.sqlConcat(
			key.slice(1).map(k => this.sqlIdentifier(k)),
			",",
			"{",
			"}",
		);
	}

	/** Get the Postgres JSONB extract syntax, e.g. `"a" #>> {"b","c"}` */
	override sqlExtract(key: DataPath): SQLFragment {
		const column = this.sqlIdentifier(key[0]);
		if (key.length > 1) {
			const path = this.sqlPath(key);
			return this.sql`${column} #>> ${path}`;
		}
		return column;
	}

	// Override to implement `with` and `omit` updates and deeply nested JSONB values.
	override sqlUpdate(update: Update): SQLFragment {
		const { action, key, value } = update;
		const column = this.sqlIdentifier(key[0]);

		// Implement all updates for deeply nested paths.
		if (key.length > 1) {
			const path = this.sqlPath(key);
			if (action === "set") {
				return this.sql`${column} = jsonb_set(${column}, ${path}, ${value})`;
			}
			if (action === "sum") {
				return this.sql`${column} = jsonb_set(${column}, ${path}, (${column} #>> ${path}) + ${value})`;
			}
			const source = this.sql`${column} #> ${path}`;
			if (action === "with") {
				return this.sql`${column} = jsonb_set(${column}, ${path}, ${source} || (
					SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
					FROM jsonb_array_elements(${value}) AS elem
					WHERE NOT ${source} @> jsonb_build_array(elem)
				), false)`;
			}
			if (action === "omit") {
				return this.sql`${column} = jsonb_set(${column}, ${path}, (
					SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
					FROM jsonb_array_elements(${source}) AS elem
					WHERE NOT ${value} @> jsonb_build_array(elem)
				), false)`;
			}
			return action; // Never happens.
		}

		// Implement `with` and `omit` on flat values.
		if (action === "with") {
			return this.sql`${column} = ${column} || (
				SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
				FROM jsonb_array_elements(${value}) AS elem
				WHERE NOT ${column} @> jsonb_build_array(elem)
			)`;
		}
		if (action === "omit") {
			return this.sql`${column} = (
				SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
				FROM jsonb_array_elements(${column}) AS elem
				WHERE NOT ${value} @> jsonb_build_array(elem)
			)`;
		}

		return super.sqlUpdate(update);
	}

	// Override to implement deeply-nested JSONB queries.
	override sqlFilter(filter: QueryFilter): SQLFragment {
		const { key, operator, value } = filter;

		// Implement `contains` filters.
		if (operator === "contains") return this.sql`${this.sqlExtract(key)} @> ${[value]}`;

		return super.sqlFilter(filter);
	}
}
