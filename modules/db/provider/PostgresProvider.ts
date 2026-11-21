import type { Data } from "../../util/data.js";
import type { Identifier } from "../../util/item.js";
import type { QueryFilter } from "../../util/query.js";
import type { Segments } from "../../util/string.js";
import type { Update } from "../../util/update.js";
import { type SQLFragment, SQLProvider } from "./SQLProvider.js";

/**
 * Abstract PostgreSQL provider with JSONB function support for nested keys, array containment, and array mutations.
 *
 * @see https://shelving.cc/db/PostgresProvider
 */
export abstract class PostgresProvider<I extends Identifier = Identifier, T extends Data = Data> extends SQLProvider<I, T> {
	/** Get the Postgres `text[]` path for the nested segments of a key, as a bound value, e.g. `'{"b","c"}'::text[]`. */
	private sqlPath(key: Segments): SQLFragment {
		const path = `{${key
			.slice(1)
			.map(k => `"${k.replaceAll("\\", "\\\\").replaceAll(`"`, `\\"`)}"`)
			.join(",")}}`;
		return this.sql`${path}::text[]`;
	}

	/** Get a value as a bound `jsonb` value, e.g. `'123'::text::jsonb`, so it compares with (and writes into) a nested JSONB value. */
	private sqlJSON(value: unknown): SQLFragment {
		return this.sql`${JSON.stringify(value)}::text::jsonb`; // Bind as `text` and cast, so every driver sends the JSON as it is.
	}

	/** Extract via the Postgres `#>` JSONB operator for nested keys, e.g. `"a" #> '{"b"}'::text[]`. The result is `jsonb`, so numbers compare and sort as numbers. */
	override sqlExtract(key: Segments): SQLFragment {
		const column = this.sqlIdentifier(key[0]);
		if (key.length > 1) {
			const path = this.sqlPath(key);
			return this.sql`${column} #> ${path}`;
		}
		return column;
	}

	/** Add Postgres JSONB support for nested keys and `with` / `omit` array mutations. */
	override sqlUpdate(update: Update): SQLFragment {
		const { action, key, value } = update;
		const column = this.sqlIdentifier(key[0]);

		// Implement all updates for deeply nested paths.
		if (key.length > 1) {
			const path = this.sqlPath(key);
			if (action === "set") {
				return this.sql`${column} = jsonb_set(${column}, ${path}, ${this.sqlJSON(value)})`;
			}
			if (action === "sum") {
				// A value that is not a number counts as zero, so the sum sets it.
				return this.sql`${column} = jsonb_set(${column}, ${path}, to_jsonb(
					CASE WHEN jsonb_typeof(${column} #> ${path}) = 'number' THEN (${column} #>> ${path})::numeric ELSE 0 END + ${value}
				))`;
			}
			const source = this.sql`${column} #> ${path}`;
			const json = this.sqlJSON(value);
			if (action === "with") {
				return this.sql`${column} = jsonb_set(${column}, ${path}, ${source} || (
					SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
					FROM jsonb_array_elements(${json}) AS elem
					WHERE NOT ${source} @> jsonb_build_array(elem)
				), false)`;
			}
			if (action === "omit") {
				return this.sql`${column} = jsonb_set(${column}, ${path}, (
					SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
					FROM jsonb_array_elements(${source}) AS elem
					WHERE NOT ${json} @> jsonb_build_array(elem)
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

	/** Add Postgres JSONB support for `contains` filters and nested keys, and boolean literals for empty `in` / `out` filters. */
	override sqlFilter(filter: QueryFilter): SQLFragment {
		const { key, operator, value } = filter;

		// Implement `contains` filters.
		if (operator === "contains") return this.sql`${this.sqlExtract(key)} @> ${[value]}`;

		// Postgres `WHERE` requires a boolean, so empty `in` / `out` filters can't use the base class's `0` / `1` integer literals.
		if (operator === "in" && !value.length) return this.sql`FALSE`;
		if (operator === "out" && !value.length) return this.sql`TRUE`;

		// A nested key extracts a `jsonb` value, so compare it with `jsonb` values.
		if (key.length > 1) {
			if (operator === "in" || operator === "out") return super.sqlFilter({ key, operator, value: value.map(v => this.sqlJSON(v)) });
			if (value !== null) return super.sqlFilter({ ...filter, value: this.sqlJSON(value) });
		}

		return super.sqlFilter(filter);
	}
}
