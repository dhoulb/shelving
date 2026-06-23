import type { Data } from "../../util/data.js";
import type { Identifier } from "../../util/item.js";
import type { QueryFilter } from "../../util/query.js";
import type { Segments } from "../../util/string.js";
import type { Update } from "../../util/update.js";
import { type SQLFragment, SQLProvider } from "./SQLProvider.js";

/**
 * Abstract PostgreSQL provider with JSONB function support for nested keys, array containment, and array mutations.
 *
 * @example
 *  class MyProvider extends PostgreSQLProvider { async exec(strings, ...values) { ... } }
 *  const item = await new MyProvider().getItem(collection, "abc");
 * @see https://shelving.cc/db/PostgreSQLProvider
 */
export abstract class PostgreSQLProvider<I extends Identifier = Identifier, T extends Data = Data> extends SQLProvider<I, T> {
	/** Get the Postgres JSONB path for the nested segments of a key, e.g. `{"b","c"}`. */
	private sqlPath(key: Segments): SQLFragment {
		return this.sqlConcat(
			key.slice(1).map(k => this.sqlIdentifier(k)),
			",",
			"{",
			"}",
		);
	}

	/**
	 * Get the Postgres JSONB extract syntax for a key, e.g. `"a" #>> {"b","c"}`.
	 *
	 * @param key The key segments identifying the column and any nested JSONB path.
	 * @returns An `SQLFragment` extracting the value.
	 * @example this.sqlExtract(["a", "b"]); // "a" #>> {"b"}
	 * @see https://shelving.cc/db/PostgreSQLProvider/sqlExtract
	 */
	override sqlExtract(key: Segments): SQLFragment {
		const column = this.sqlIdentifier(key[0]);
		if (key.length > 1) {
			const path = this.sqlPath(key);
			return this.sql`${column} #>> ${path}`;
		}
		return column;
	}

	/**
	 * Define an SQL fragment for a single update action, with Postgres JSONB support for nested keys and `with`/`omit` array mutations.
	 *
	 * @param update The update action (`action`, `key`, `value`) to convert.
	 * @returns The composed `SQLFragment`.
	 * @throws {UnimplementedError} If the action is unsupported.
	 * @example this.sqlUpdate({ action: "set", key: ["a", "b"], value: 1 })
	 * @see https://shelving.cc/db/PostgreSQLProvider/sqlUpdate
	 */
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

	/**
	 * Define an SQL fragment for a filter clause, with Postgres JSONB support for `contains` and deeply-nested queries.
	 *
	 * @param filter The filter (`key`, `operator`, `value`) to translate.
	 * @returns The composed `SQLFragment`.
	 * @throws {UnimplementedError} If the operator is unsupported.
	 * @example this.sqlFilter({ key: ["tags"], operator: "contains", value: "x" })
	 * @see https://shelving.cc/db/PostgreSQLProvider/sqlFilter
	 */
	override sqlFilter(filter: QueryFilter): SQLFragment {
		const { key, operator, value } = filter;

		// Implement `contains` filters.
		if (operator === "contains") return this.sql`${this.sqlExtract(key)} @> ${[value]}`;

		return super.sqlFilter(filter);
	}
}
