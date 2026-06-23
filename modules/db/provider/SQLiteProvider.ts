import { StringSchema } from "../../schema/StringSchema.js";
import type { Data } from "../../util/data.js";
import type { Identifier } from "../../util/item.js";
import type { QueryFilter } from "../../util/query.js";
import type { Segments } from "../../util/string.js";
import type { Update } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { type SQLFragment, SQLProvider } from "./SQLProvider.js";

/**
 * Abstract SQLite provider with JSON1 function support for nested keys, array containment, and array mutations.
 *
 * Note the following compatibility caveats:
 * - For `with` and `omit` updates this does not preserve ordering of the original array.
 * - For `with` and `omit` updates this does not guarantee equality for de-duplication when working with nested objects or arrays.
 *
 * @example
 *  class MyProvider extends SQLiteProvider { async exec(strings, ...values) { ... } }
 *  const item = await new MyProvider().getItem(collection, "abc");
 * @see https://shelving.cc/db/SQLiteProvider
 */
export abstract class SQLiteProvider<I extends Identifier = Identifier, T extends Data = Data> extends SQLProvider<I, T> {
	/**
	 * Insert a new item and return its ID, generating a UUID client-side for string-keyed collections.
	 * - SQLite has no native UUID generation, so for `StringSchema` IDs the UUID is generated here and delegated to `setItem`.
	 *
	 * @param collection The collection to insert into.
	 * @param data The data of the item to insert.
	 * @returns Promise resolving to the ID of the inserted item.
	 * @example await provider.addItem(collection, { name: "Dave" })
	 * @see https://shelving.cc/db/SQLiteProvider/addItem
	 */
	// SQLite has no native UUID generation, so when the collection uses a `StringSchema` ID
	// we generate the UUID client-side and delegate to `setItem`.
	// Note: `as II` is required here because TypeScript cannot narrow the generic `II` from `instanceof StringSchema`.
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		if (collection.id instanceof StringSchema) {
			const id = crypto.randomUUID() as II; // `as II` needed: TypeScript can't narrow II from instanceof check.
			await this.setItem(collection, id, data);
			return id;
		}
		return super.addItem(collection, data);
	}

	/** Get the SQLite JSON path for the nested segments of a key (everything after the column name), e.g. `$.b.c` */
	private sqlPath(key: Segments): SQLFragment {
		return this.sqlConcat(
			key.slice(1).map(k => this.sqlIdentifier(k)),
			".",
			"$.",
		);
	}

	/**
	 * Get the SQLite JSON extract syntax for a key, e.g. `json_extract("a", $.b.c)`.
	 *
	 * @param key The key segments identifying the column and any nested JSON path.
	 * @returns An `SQLFragment` extracting the value.
	 * @example this.sqlExtract(["a", "b"]); // json_extract("a", $.b)
	 * @see https://shelving.cc/db/SQLiteProvider/sqlExtract
	 */
	override sqlExtract(key: Segments): SQLFragment {
		const column = this.sqlIdentifier(key[0]);
		if (key.length > 1) {
			const path = this.sqlPath(key);
			return this.sql`json_extract(${column}, ${path})`;
		}
		return column;
	}

	/**
	 * Define an SQL fragment for a single update action, with SQLite JSON1 support for nested keys and `with`/`omit` array mutations.
	 *
	 * @param update The update action (`action`, `key`, `value`) to convert.
	 * @returns The composed `SQLFragment`.
	 * @throws {UnimplementedError} If the action is unsupported.
	 * @example this.sqlUpdate({ action: "set", key: ["a", "b"], value: 1 })
	 * @see https://shelving.cc/db/SQLiteProvider/sqlUpdate
	 */
	override sqlUpdate(update: Update): SQLFragment {
		const { action, key, value } = update;
		const column = this.sqlIdentifier(key[0]);

		// Implement all updates for deeply nested paths.
		if (key.length > 1) {
			const path = this.sqlPath(key);
			if (action === "set") {
				return this.sql`${column} = json_set(${column}, ${path}, ${value})`;
			}
			if (action === "sum") {
				return this.sql`${column} = json_set(${column}, ${path}, json_extract(${column}, ${path}) + ${value})`;
			}
			const source = this.sql`json_extract(${column}, ${path})`;
			if (action === "with") {
				return this.sql`${column} = json_set(${column}, ${path}, (
					SELECT COALESCE(json_group_array(v), '[]')
					FROM (
						SELECT s.value AS v FROM json_each(${source}) AS s
						UNION
						SELECT v.value AS v FROM json_each(${value}) AS v
					)
				))`;
			}
			if (action === "omit") {
				return this.sql`${column} = json_set(${column}, ${path}, (
					SELECT COALESCE(json_group_array(s.value), '[]')
					FROM json_each(${source}) AS s
					WHERE NOT EXISTS (
						SELECT 1
						FROM json_each(${value}) AS v
						WHERE v.value = s.value
					)
				))`;
			}
			return action; // Never happens.
		}

		// Implement `with` and `omit` on flat values.
		if (action === "with") {
			return this.sql`${column} = (
				SELECT COALESCE(json_group_array(v), '[]')
				FROM (
					SELECT value AS v FROM json_each(${column})
					UNION
					SELECT value AS v FROM json_each(${value})
				)
			)`;
		}
		if (action === "omit") {
			return this.sql`${column} = (
				SELECT COALESCE(json_group_array(s.value), '[]')
				FROM json_each(${column}) AS s
				WHERE NOT EXISTS (
					SELECT 1
					FROM json_each(${value}) AS v
					WHERE v.value = s.value
				)
			)`;
		}

		return super.sqlUpdate(update);
	}

	/**
	 * Define an SQL fragment for a filter clause, with SQLite JSON1 support for `contains` and deeply-nested JSON queries.
	 *
	 * @param filter The filter (`key`, `operator`, `value`) to translate.
	 * @returns The composed `SQLFragment`.
	 * @throws {UnimplementedError} If the operator is unsupported.
	 * @example this.sqlFilter({ key: ["tags"], operator: "contains", value: "x" })
	 * @see https://shelving.cc/db/SQLiteProvider/sqlFilter
	 */
	override sqlFilter(filter: QueryFilter): SQLFragment {
		const { key, operator, value } = filter;

		// Implement `contains` filters.
		if (operator === "contains") {
			const column = this.sqlIdentifier(key[0]);
			if (key.length > 1) {
				const path = this.sqlPath(key);
				return this.sql`EXISTS (
					SELECT 1
					FROM json_each(${column}, ${path}) as v
					WHERE v.value = ${value}
				)`;
			}
			return this.sql`EXISTS (
				SELECT 1
				FROM json_each(${column}) as v
				WHERE v.value = ${value}
			)`;
		}

		return super.sqlFilter(filter);
	}
}
