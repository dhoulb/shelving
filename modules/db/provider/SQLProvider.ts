import { RequiredError } from "../../error/RequiredError.js";
import { UnimplementedError } from "../../error/UnimplementedError.js";
import type { ImmutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Segments } from "../../util/index.js";
import type { Identifier, Item, Items, ItemsSequence, OptionalItem, OptionalItemSequence } from "../../util/item.js";
import { getQueryFilters, getQueryLimit, getQueryOrders, type Query, type QueryFilter, type QueryOrder } from "../../util/query.js";
import { getUpdates, type Update, type Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { DBProvider } from "./DBProvider.js";

/**
 * SQL fragment made from template strings plus embedded expressions, ready to be composed into a query.
 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLFragment
 */
export interface SQLFragment {
	readonly strings: ImmutableArray<string>;
	readonly values: ImmutableArray<unknown>;
}

type CountRow = {
	readonly count: number;
};

/**
 * Abstract database provider that implements CRUD and query operations by generating and executing SQL.
 *
 * - Subclasses implement `exec()` to run a query against a concrete database (e.g. SQLite, PostgreSQL).
 * - The `sql*` helpers build composable `SQLFragment` objects so dialect differences can be overridden.
 * - Realtime subscriptions are unsupported and throw `UnimplementedError`.
 *
 * @example
 *  class MyProvider extends SQLProvider { async exec(strings, ...values) { ... } }
 *  const item = await new MyProvider().getItem(collection, "abc");
 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider
 */
export abstract class SQLProvider<I extends Identifier = Identifier, T extends Data = Data> extends DBProvider<I, T> {
	/**
	 * Execute an SQL query built from a template literal and return the resulting rows.
	 *
	 * @param strings The template string parts of the query.
	 * @param values The interpolated values to bind into the query.
	 * @returns Promise resolving to the array of rows returned by the database.
	 * @example await provider.exec`SELECT * FROM ${table}`
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/exec
	 */
	abstract exec<X extends Data>(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): Promise<ImmutableArray<X>>;

	/**
	 * Get a single item by ID, or `undefined` if it doesn't exist.
	 *
	 * @param collection The collection to read from.
	 * @param id The ID of the item to get.
	 * @returns Promise resolving to the item, or `undefined` if it doesn't exist.
	 * @example await provider.getItem(collection, "abc")
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/getItem
	 */
	override async getItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<OptionalItem<II, TT>> {
		const rows = await this.exec<Item<II, TT>>`
			SELECT * FROM ${this.sqlIdentifier(collection.name)}
			WHERE ${this.sqlIdentifier("id")} = ${id}
			LIMIT 1
		`;
		return rows[0];
	}

	/**
	 * Subscribe to realtime updates for a single item — unsupported by SQL providers.
	 *
	 * @param collection The collection to read from.
	 * @param id The ID of the item to subscribe to.
	 * @returns Never returns; always throws.
	 * @throws {UnimplementedError} Always, because SQL providers don't support realtime subscriptions.
	 * @example provider.getItemSequence(collection, "abc") // throws
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/getItemSequence
	 */
	override getItemSequence<II extends I, TT extends T>(_collection: Collection<string, II, TT>, _id: II): OptionalItemSequence<II, TT> {
		throw new UnimplementedError(`SQLProvider does not support realtime subscriptions`);
	}

	/**
	 * Insert a new item and return its generated ID.
	 *
	 * @param collection The collection to insert into.
	 * @param data The data of the item to insert.
	 * @returns Promise resolving to the ID of the inserted item.
	 * @throws {RequiredError} If the `INSERT` didn't return an ID.
	 * @example await provider.addItem(collection, { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/addItem
	 */
	override async addItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, data: TT): Promise<II> {
		const rows = await this.exec<{ id: II }>`
			INSERT INTO ${this.sqlIdentifier(collection.name)} ${this.sqlValues(data)}
			RETURNING ${this.sqlIdentifier("id")}
		`;
		const id = rows[0]?.id;
		if (id === undefined) throw new RequiredError(`No id returned from INSERT into "${collection.name}"`, { provider: this });
		return id;
	}

	/**
	 * Set (insert or overwrite) an item at a specific ID.
	 *
	 * @param collection The collection to write to.
	 * @param id The ID of the item to set.
	 * @param data The full data to store for the item.
	 * @returns Promise that resolves once the item has been set.
	 * @example await provider.setItem(collection, "abc", { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/setItem
	 */
	override async setItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II, data: TT): Promise<void> {
		await this.exec`
			INSERT INTO ${this.sqlIdentifier(collection.name)} ${this.sqlValues({ id, ...data })}
			ON CONFLICT (${this.sqlIdentifier("id")}) DO UPDATE SET ${this.sqlSetters(data)}
		`;
	}

	/**
	 * Apply a set of updates to a single item by ID.
	 *
	 * @param collection The collection to write to.
	 * @param id The ID of the item to update.
	 * @param updates The updates to apply.
	 * @returns Promise that resolves once the item has been updated.
	 * @example await provider.updateItem(collection, "abc", { name: "Dave" })
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/updateItem
	 */
	override async updateItem<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		id: II,
		updates: Updates<Item<II, TT>>,
	): Promise<void> {
		await this.exec`
			UPDATE ${this.sqlIdentifier(collection.name)}
			SET ${this.sqlUpdates(updates)}
			WHERE ${this.sqlIdentifier("id")} = ${id}
		`;
	}

	/**
	 * Delete a single item by ID.
	 *
	 * @param collection The collection to delete from.
	 * @param id The ID of the item to delete.
	 * @returns Promise that resolves once the item has been deleted.
	 * @example await provider.deleteItem(collection, "abc")
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/deleteItem
	 */
	override async deleteItem<II extends I, TT extends T>(collection: Collection<string, II, TT>, id: II): Promise<void> {
		await this.exec`DELETE FROM ${this.sqlIdentifier(collection.name)} WHERE ${this.sqlIdentifier("id")} = ${id}`;
	}

	/**
	 * Count the items in a collection that match an optional query.
	 *
	 * @param collection The collection to count.
	 * @param query Optional query to filter the items to count.
	 * @returns Promise resolving to the number of matching items.
	 * @example await provider.countQuery(collection, query)
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/countQuery
	 */
	override async countQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<number> {
		const rows = await this.exec<CountRow>`
			SELECT COUNT(*) AS "count" FROM ${this.sqlIdentifier(collection.name)}
			${query ? this.sqlClauses(query) : this.sql``}
		`;
		return rows[0]?.count ?? 0;
	}

	/**
	 * Get the items in a collection that match an optional query.
	 *
	 * @param collection The collection to read from.
	 * @param query Optional query to filter, sort, and limit the items.
	 * @returns Promise resolving to the array of matching items.
	 * @example await provider.getQuery(collection, query)
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/getQuery
	 */
	override async getQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query?: Query<Item<II, TT>>,
	): Promise<Items<II, TT>> {
		return this.exec<Item<II, TT>>`
			SELECT * FROM ${this.sqlIdentifier(collection.name)}
			${query ? this.sqlClauses(query) : this.sql``}
		`;
	}

	/**
	 * Subscribe to realtime updates for a query — unsupported by SQL providers.
	 *
	 * @param collection The collection to read from.
	 * @param query Optional query to subscribe to.
	 * @returns Never returns; always throws.
	 * @throws {UnimplementedError} Always, because SQL providers don't support realtime subscriptions.
	 * @example provider.getQuerySequence(collection, query) // throws
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/getQuerySequence
	 */
	override getQuerySequence<II extends I, TT extends T>(
		_collection: Collection<string, II, TT>,
		_query?: Query<Item<II, TT>>,
	): ItemsSequence<II, TT> {
		throw new UnimplementedError(`SQLProvider does not support realtime subscriptions`);
	}

	/**
	 * Set (overwrite) the data of every item matching a query.
	 *
	 * @param collection The collection to write to.
	 * @param query The query selecting the items to set.
	 * @param data The full data to store for each matching item.
	 * @returns Promise that resolves once the matching items have been set.
	 * @example await provider.setQuery(collection, query, { active: true })
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/setQuery
	 */
	override async setQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		data: TT,
	): Promise<void> {
		await this.exec`UPDATE ${this.sqlIdentifier(collection.name)} SET ${this.sqlSetters(data)}${this.sqlClauses(query)}`;
	}

	/**
	 * Apply a set of updates to every item matching a query.
	 *
	 * @param collection The collection to write to.
	 * @param query The query selecting the items to update.
	 * @param updates The updates to apply to each matching item.
	 * @returns Promise that resolves once the matching items have been updated.
	 * @example await provider.updateQuery(collection, query, { active: true })
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/updateQuery
	 */
	override async updateQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
		updates: Updates<TT>,
	): Promise<void> {
		await this.exec`UPDATE ${this.sqlIdentifier(collection.name)} SET ${this.sqlUpdates(updates)}${this.sqlClauses(query)}`;
	}

	/**
	 * Delete every item matching a query.
	 *
	 * @param collection The collection to delete from.
	 * @param query The query selecting the items to delete.
	 * @returns Promise that resolves once the matching items have been deleted.
	 * @example await provider.deleteQuery(collection, query)
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/deleteQuery
	 */
	override async deleteQuery<II extends I, TT extends T>(
		collection: Collection<string, II, TT>,
		query: Query<Item<II, TT>>,
	): Promise<void> {
		await this.exec`DELETE FROM ${this.sqlIdentifier(collection.name)}${this.sqlClauses(query)}`;
	}

	/**
	 * Define an SQL fragment using Javascript template literal format.
	 *
	 * @param strings The template string parts of the fragment.
	 * @param values The interpolated values to embed into the fragment.
	 * @returns The composed `SQLFragment`.
	 * @example this.sql`SELECT * FROM ${table}`; // SQLFragment
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sql
	 */
	sql(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): SQLFragment {
		return { strings, values };
	}

	/**
	 * Define an SQL fragment for an escaped identifier, e.g. `"myTable"`.
	 *
	 * @param name The identifier (table or column name) to escape.
	 * @returns An `SQLFragment` containing the quoted identifier.
	 * @example this.sqlIdentifier("myTable"); // "myTable"
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlIdentifier
	 */
	sqlIdentifier(name: string): SQLFragment {
		return { strings: [_escapeIdentifier(name)], values: [] };
	}

	/**
	 * Define an SQL fragment that extracts a value at a key for comparison, e.g. `"a" #>> {"b","c"}` in Postgres.
	 * - Base implementation only supports flat (single-segment) keys; subclasses override for nested JSON paths.
	 *
	 * @param key The key segments identifying the column (and any nested path).
	 * @returns An `SQLFragment` extracting the value.
	 * @throws {UnimplementedError} If the key is nested (multi-segment).
	 * @example this.sqlExtract(["name"]); // "name"
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlExtract
	 */
	sqlExtract(key: Segments): SQLFragment {
		if (key.length > 1) throw new UnimplementedError("SQLProvider does not support nested filter keys");
		return this.sqlIdentifier(key[0]);
	}

	/**
	 * Define an SQL fragment that joins a series of fragments with a separator, e.g. `"a" = 1 AND "b" = 2`.
	 *
	 * @param values The fragments to join.
	 * @param separator The separator placed between fragments.
	 * @param before Text placed before the first fragment.
	 * @param after Text placed after the last fragment.
	 * @returns The joined `SQLFragment`.
	 * @example this.sqlConcat([a, b], " AND "); // a AND b
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlConcat
	 */
	sqlConcat(values: ImmutableArray<SQLFragment>, separator = ", ", before = "", after = ""): SQLFragment {
		const strings = [before, ...new Array(Math.max(0, values.length - 1)).fill(separator), after];
		return { strings, values };
	}

	/**
	 * Define an SQL fragment for setting a list of values, e.g. `"a" = 1, "b" = 2`.
	 *
	 * @param data The data whose entries become `column = value` assignments.
	 * @returns The composed `SQLFragment`.
	 * @example this.sqlSetters({ a: 1, b: 2 }); // "a" = 1, "b" = 2
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlSetters
	 */
	sqlSetters<TT extends Data>(data: TT): SQLFragment {
		const entries = Object.entries(data);
		return this.sqlConcat(
			entries.map(([key, value]) => this.sql`${this.sqlIdentifier(key)} = ${value}`),
			", ",
		);
	}

	/**
	 * Define an SQL fragment for a set of updates, e.g. `"a" = 1, "b" = "b" + 5`.
	 *
	 * @param updates The updates to convert into SQL assignments.
	 * @returns The composed `SQLFragment`.
	 * @example this.sqlUpdates({ a: 1 }); // "a" = 1
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlUpdates
	 */
	sqlUpdates<TT extends Data>(updates: Updates<TT>): SQLFragment {
		return this.sqlConcat(
			getUpdates(updates).map(update => this.sqlUpdate(update)),
			", ",
		);
	}

	/**
	 * Define an SQL fragment for a single update action.
	 * - Handles flat `set` and `sum` only (single-segment key).
	 * - Nested keys (multi-segment) and `with`/`omit` actions throw `UnimplementedError`.
	 * - Subclasses should override to support nested keys and array mutation actions.
	 *
	 * @param update The update action (`action`, `key`, `value`) to convert.
	 * @returns The composed `SQLFragment`.
	 * @throws {UnimplementedError} If the key is nested or the action is unsupported.
	 * @example this.sqlUpdate({ action: "set", key: ["a"], value: 1 }); // "a" = 1
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlUpdate
	 */
	sqlUpdate({ action, key, value }: Update): SQLFragment {
		if (key.length > 1) throw new UnimplementedError("SQLProvider does not support nested update keys");
		const column = this.sqlIdentifier(key[0]);
		if (action === "set") return this.sql`${column} = ${value}`;
		if (action === "sum") return this.sql`${column} = ${column} + ${value}`;
		throw new UnimplementedError(`SQLProvider does not support "${action}" updates`);
	}

	/**
	 * Define an SQL fragment for `VALUES` syntax, e.g. `("a", "b") VALUES (1, 2)`.
	 *
	 * @param data The data whose keys and values become the column list and values.
	 * @returns The composed `SQLFragment`.
	 * @example this.sqlValues({ a: 1, b: 2 }); // ("a", "b") VALUES (1, 2)
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlValues
	 */
	sqlValues(data: Data): SQLFragment {
		const entries = Object.entries(data);
		const keys = this.sqlConcat(
			entries.map(([key]) => this.sqlIdentifier(key)),
			", ",
		);
		const values = this.sqlConcat(
			entries.map(([, value]) => this.sql`${value}`),
			", ",
		);
		return this.sql`(${keys}) VALUES (${values})`;
	}

	/**
	 * Define an SQL fragment for the `WHERE`, `ORDER BY` and `LIMIT` clauses of a query, e.g. ` WHERE x = 1 ORDER BY "name" LIMIT 0, 50`.
	 *
	 * @param query The query to translate into clauses.
	 * @returns The composed `SQLFragment`.
	 * @example this.sqlClauses(query); // WHERE ... ORDER BY ... LIMIT ...
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlClauses
	 */
	sqlClauses(query: Query<Item>) {
		return this.sql`${this.sqlWhere(query)}${this.sqlOrder(query)}${this.sqlLimit(query)}`;
	}

	/**
	 * Define an SQL fragment for a `WHERE` clause, e.g. ` WHERE x = 1 AND y <= 100`.
	 *
	 * @param query The query whose filters become the `WHERE` clause.
	 * @returns The composed `SQLFragment` (empty if there are no filters).
	 * @example this.sqlWhere(query); // WHERE x = 1
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlWhere
	 */
	sqlWhere(query: Query<Item>) {
		const filters = getQueryFilters(query);
		if (filters.length) return this.sql``;
		return this.sql` WHERE ${this.sqlConcat(
			filters.map(filter => this.sqlFilter(filter)),
			" AND ",
		)}`;
	}

	/**
	 * Define an SQL fragment for a single filter clause on a column, e.g. `x = 1` or `x IN (1, 2)`.
	 *
	 * @param filter The filter (`key`, `operator`, `value`) to translate.
	 * @returns The composed `SQLFragment`.
	 * @throws {UnimplementedError} If the operator is unsupported.
	 * @example this.sqlFilter({ key: ["x"], operator: "is", value: 1 }); // "x" = 1
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlFilter
	 */
	sqlFilter({ key, operator, value }: QueryFilter): SQLFragment {
		const path = this.sqlExtract(key);
		if (operator === "in") {
			if (!value.length) return this.sql`0`;
			return this.sql`${path} IN (${this.sqlConcat(value.map(v => this.sql`${v}`))})`;
		}
		if (operator === "out") {
			if (!value.length) return this.sql`1`;
			return this.sql`(${path} IS NULL OR ${path} NOT IN (${this.sqlConcat(value.map(v => this.sql`${v}`))}))`;
		}
		if (operator === "is") return value === null ? this.sql`${path} IS NULL` : this.sql`${path} = ${value}`;
		if (operator === "not") return value === null ? this.sql`${path} IS NOT NULL` : this.sql`(${path} IS NULL OR ${path} != ${value})`;
		if (operator === "lt") return this.sql`${path} < ${value}`;
		if (operator === "lte") return this.sql`${path} <= ${value}`;
		if (operator === "gt") return this.sql`${path} > ${value}`;
		if (operator === "gte") return this.sql`${path} >= ${value}`;
		throw new UnimplementedError(`SQLProvider does not support "${operator}" filters`);
	}

	/**
	 * Define an SQL fragment for an `ORDER BY` clause, e.g. ` ORDER BY "a" ASC, "b" DESC`.
	 * - Nested keys (multi-segment) throw `UnimplementedError`.
	 *
	 * @param query The query whose orders become the `ORDER BY` clause.
	 * @returns The composed `SQLFragment` (empty if there are no orders).
	 * @throws {UnimplementedError} If an order key is nested (multi-segment).
	 * @example this.sqlOrder(query); // ORDER BY "a" ASC
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlOrder
	 */
	sqlOrder(query: Query<Item>) {
		const orders = getQueryOrders(query);
		if (orders.length < 1) return this.sql``;
		return this.sql` ORDER BY ${this.sqlConcat(
			orders.map(order => this.sqlSort(order)),
			", ",
		)}`;
	}

	/**
	 * Define an SQL fragment for an individual column in an `ORDER BY`, e.g. `"a" ASC`.
	 *
	 * @param order The order (`key`, `direction`) to translate.
	 * @returns The composed `SQLFragment`.
	 * @example this.sqlSort({ key: ["a"], direction: "asc" }); // "a" ASC
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlSort
	 */
	sqlSort({ key, direction }: QueryOrder): SQLFragment {
		const path = this.sqlExtract(key);
		if (direction === "asc") return this.sql`${path} ASC`;
		if (direction === "desc") return this.sql`${path} DESC`;
		return direction; // Never happens.
	}

	/**
	 * Define an SQL fragment for a `LIMIT` clause, e.g. ` LIMIT 50`.
	 *
	 * @param query The query whose limit becomes the `LIMIT` clause.
	 * @returns The composed `SQLFragment` (empty if the query has no limit).
	 * @example this.sqlLimit(query); // LIMIT 50
	 * @see https://dhoulb.github.io/shelving/db/provider/SQLProvider/SQLProvider/sqlLimit
	 */
	sqlLimit(query: Query<Item>) {
		const limit = getQueryLimit(query);
		return typeof limit === "number" ? this.sql` LIMIT ${limit}` : this.sql``;
	}
}

function _escapeIdentifier(name: string): string {
	return `"${name.replaceAll(`"`, `""`)}"`;
}
