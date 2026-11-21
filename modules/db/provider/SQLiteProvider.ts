import { ArraySchema } from "../../schema/ArraySchema.js";
import { BooleanSchema } from "../../schema/BooleanSchema.js";
import { DataSchema } from "../../schema/DataSchema.js";
import { DictionarySchema } from "../../schema/DictionarySchema.js";
import type { Schema } from "../../schema/Schema.js";
import { StringSchema } from "../../schema/StringSchema.js";
import type { ImmutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Identifier, Item, Items, OptionalItem } from "../../util/item.js";
import type { Query, QueryFilter } from "../../util/query.js";
import { getSource } from "../../util/source.js";
import type { Segments } from "../../util/string.js";
import type { Update } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { type SQLFragment, SQLProvider } from "./SQLProvider.js";

/**
 * Abstract SQLite provider with JSON1 function support for nested keys, array containment, and array mutations.
 *
 * - SQLite has no boolean or JSON column types. Reads use the collection's schema to turn `0` / `1` back into booleans, and JSON text back into arrays and objects.
 * - Nested `set` updates bind the value as JSON, so booleans, arrays and objects keep their JSON type inside the column.
 *
 * - `with` and `omit` updates keep the order of the array. `with` adds new items at the end.
 *
 * Note: `with` and `omit` updates do not guarantee equality for de-duplication when working with nested objects or arrays.
 *
 * @see https://shelving.cc/db/SQLiteProvider
 */
export abstract class SQLiteProvider<I extends Identifier = Identifier, T extends Data = Data> extends SQLProvider<I, T> {
	/** Generate a UUID client-side for `StringSchema` IDs (SQLite has no native UUID), else defer to the base `INSERT`. */
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

	/** Decode the row with the collection's schema. */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const item = await super.getItem(collection, id);
		return item && _decodeItem(collection, item);
	}

	/** Decode each row with the collection's schema. */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		const items = await super.getQuery(collection, query);
		return items.map(item => _decodeItem(collection, item));
	}

	/** Get the SQLite JSON path for the nested segments of a key (everything after the column name), bound as a string, e.g. `'$."b"."c"'` */
	private sqlPath(key: Segments): SQLFragment {
		return this.sql`${`$.${key
			.slice(1)
			.map(k => JSON.stringify(k))
			.join(".")}`}`;
	}

	/** Extract via SQLite `json_extract` for nested keys, e.g. `json_extract("a", '$."b"')`. */
	override sqlExtract(key: Segments): SQLFragment {
		const column = this.sqlIdentifier(key[0]);
		if (key.length > 1) {
			const path = this.sqlPath(key);
			return this.sql`json_extract(${column}, ${path})`;
		}
		return column;
	}

	/** Add SQLite JSON1 support for nested keys and `with` / `omit` array mutations. */
	override sqlUpdate(update: Update): SQLFragment {
		const { action, key, value } = update;
		const column = this.sqlIdentifier(key[0]);

		// Implement all updates for deeply nested paths.
		if (key.length > 1) {
			const path = this.sqlPath(key);
			if (action === "set") {
				return this.sql`${column} = json_set(${column}, ${path}, json(${JSON.stringify(value)}))`;
			}
			if (action === "sum") {
				return this.sql`${column} = json_set(${column}, ${path}, json_extract(${column}, ${path}) + ${value})`;
			}
			const source = this.sql`json_extract(${column}, ${path})`;
			if (action === "with") return this.sql`${column} = json_set(${column}, ${path}, json(${this.sqlWith(source, value)}))`;
			if (action === "omit") return this.sql`${column} = json_set(${column}, ${path}, json(${this.sqlOmit(source, value)}))`;
			return action; // Never happens.
		}

		// Implement `with` and `omit` on flat values.
		if (action === "with") return this.sql`${column} = ${this.sqlWith(column, value)}`;
		if (action === "omit") return this.sql`${column} = ${this.sqlOmit(column, value)}`;

		return super.sqlUpdate(update);
	}

	/** Get a JSON array of the items in `source`, in order, then the items in `value` that `source` does not have yet. */
	private sqlWith(source: SQLFragment, value: unknown): SQLFragment {
		return this.sql`(
			SELECT COALESCE(json_group_array(v), '[]')
			FROM (
				SELECT s.value AS v, 0 AS g, s.key AS k FROM json_each(${source}) AS s
				UNION ALL
				SELECT a.value AS v, 1 AS g, MIN(a.key) AS k FROM json_each(${value}) AS a
				WHERE a.value NOT IN (SELECT s.value FROM json_each(${source}) AS s)
				GROUP BY a.value
				ORDER BY g, k
			)
		)`;
	}

	/** Get a JSON array of the items in `source`, in order, without the items in `value`. */
	private sqlOmit(source: SQLFragment, value: unknown): SQLFragment {
		return this.sql`(
			SELECT COALESCE(json_group_array(s.value), '[]')
			FROM (SELECT s.value FROM json_each(${source}) AS s ORDER BY s.key) AS s
			WHERE s.value NOT IN (SELECT a.value FROM json_each(${value}) AS a)
		)`;
	}

	/** Add SQLite JSON1 support for `contains` filters and deeply-nested JSON queries. */
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

/** Decode a SQLite row with the collection's schema: `0` / `1` become booleans, and JSON text becomes arrays and objects. */
function _decodeItem<I extends Identifier, T extends Data>(collection: Collection<string, I, T>, item: Item<I, T>): Item<I, T> {
	const props: ImmutableArray<[string, Schema<unknown>]> = Object.entries(collection.props);
	const output: Record<string, unknown> = { ...item };
	for (const [key, schema] of props) {
		const value = output[key];
		if (typeof value === "number" && getSource(BooleanSchema, schema)) output[key] = value !== 0;
		else if (
			typeof value === "string" &&
			(getSource(ArraySchema, schema) || getSource(DataSchema, schema) || getSource(DictionarySchema, schema))
		)
			output[key] = JSON.parse(value);
	}
	return output as Item<I, T>; // `as` needed: the keys are decoded at runtime.
}
