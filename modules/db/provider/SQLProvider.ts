import { UnimplementedError } from "../../error/UnimplementedError.js";
import type { ImmutableArray } from "../../util/array.js";
import type { Data, DataPath } from "../../util/data.js";
import type { Item, Items, OptionalItem } from "../../util/item.js";
import { assertNumber } from "../../util/number.js";
import { getQueryFilters, getQueryLimit, getQueryOrders, type ItemQuery, type QueryFilter, type QueryOrder } from "../../util/query.js";
import { getUpdates, type Update, type Updates } from "../../util/update.js";
import type { Collection } from "../collection/Collection.js";
import { DBProvider } from "./DBProvider.js";

/** SQL fragment made from template strings plus embedded expressions. */
export interface SQLFragment {
	readonly strings: ImmutableArray<string>;
	readonly values: ImmutableArray<unknown>;
}

type CountRow = {
	readonly count: number;
};

/** Shared SQL execution and CRUD/query behavior. */
export abstract class SQLProvider extends DBProvider<number> {
	abstract exec<T extends Data = Data>(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): Promise<ImmutableArray<T>>;

	async getItem<T extends Data>({ name }: Collection<string, number, T>, id: number): Promise<OptionalItem<number, T>> {
		const rows = await this.exec<Item<number, T>>`
			SELECT * FROM ${this.sqlIdentifier(name)}
			WHERE ${this.sqlIdentifier("id")} = ${id}
			LIMIT 1
		`;
		return rows[0];
	}

	getItemSequence<T extends Data>(_collection: Collection<string, number, T>, _id: number): AsyncIterable<OptionalItem<number, T>> {
		throw new UnimplementedError(`SQLProvider does not support realtime subscriptions`);
	}

	async addItem<T extends Data>({ name }: Collection<string, number, T>, data: T): Promise<number> {
		const rows = await this.exec<{ id: number }>`
			INSERT INTO ${this.sqlIdentifier(name)} ${this.sqlValues(data)}
			RETURNING ${this.sqlIdentifier("id")}
		`;
		const id = rows[0]?.id;
		assertNumber(id);
		return id;
	}

	async setItem<T extends Data>({ name }: Collection<string, number, T>, id: number, data: T): Promise<void> {
		await this.exec`
			INSERT INTO ${this.sqlIdentifier(name)} ${this.sqlValues({ id, ...data })}
			ON CONFLICT (${this.sqlIdentifier("id")}) DO UPDATE SET ${this.sqlSetters(data)}
		`;
	}

	async updateItem<T extends Data>({ name }: Collection<string, number, T>, id: number, updates: Updates<T>): Promise<void> {
		await this.exec<Item<number, T>>`
			UPDATE ${this.sqlIdentifier(name)}
			SET ${this.sqlUpdates(updates)}
			WHERE ${this.sqlIdentifier("id")} = ${id}
		`;
	}

	async deleteItem<T extends Data>({ name }: Collection<string, number, T>, id: number): Promise<void> {
		await this.exec`DELETE FROM ${this.sqlIdentifier(name)} WHERE ${this.sqlIdentifier("id")} = ${id}`;
	}

	override async countQuery<T extends Data>({ name }: Collection<string, number, T>, query?: ItemQuery<number, T>): Promise<number> {
		const rows = await this.exec<CountRow>`
			SELECT COUNT(*) AS "count" FROM ${this.sqlIdentifier(name)}
			${query ? this.sqlClauses(query) : this.sql``}
		`;
		return rows[0]?.count ?? 0;
	}

	async getQuery<T extends Data>({ name }: Collection<string, number, T>, query?: ItemQuery<number, T>): Promise<Items<number, T>> {
		return this.exec`
			SELECT * FROM ${this.sqlIdentifier(name)}
			${query ? this.sqlClauses(query) : this.sql``}
		`;
	}

	getQuerySequence<T extends Data>(_c: Collection<string, number, T>, _q?: ItemQuery<number, T>): AsyncIterable<Items<number, T>> {
		throw new UnimplementedError(`SQLProvider does not support realtime subscriptions`);
	}

	async setQuery<T extends Data>({ name }: Collection<string, number, T>, query: ItemQuery<number, T>, data: T): Promise<void> {
		await this.exec<Item<number, T>>`UPDATE ${this.sqlIdentifier(name)} SET ${this.sqlSetters(data)}${this.sqlClauses(query)}`;
	}

	async updateQuery<T extends Data>(
		{ name }: Collection<string, number, T>,
		query: ItemQuery<number, T>,
		updates: Updates<T>,
	): Promise<void> {
		await this.exec<Item<number, T>>`UPDATE ${this.sqlIdentifier(name)} SET ${this.sqlUpdates(updates)}${this.sqlClauses(query)}`;
	}

	async deleteQuery<T extends Data>({ name }: Collection<string, number, T>, query: ItemQuery<number, T>): Promise<void> {
		await this.exec<Item<number, T>>`DELETE FROM ${this.sqlIdentifier(name)}${this.sqlClauses(query)}`;
	}

	/**
	 * Define an SQL fragment using Javascript template literal format.
	 * @example this.sql`SELECT * FROM ${table}`; // SQLFragment
	 */
	sql(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): SQLFragment {
		return { strings, values };
	}

	/** Define an SQL fragment for an identifier, e.g. `"myTable"` */
	sqlIdentifier(name: string): SQLFragment {
		return { strings: [_escapeIdentifier(name)], values: [] };
	}

	/** Define an SQL fragment that extracts a deeply nested calue for comparison, e.g. `"a" #>> {"b","c"}` in Postgres */
	sqlExtract(key: DataPath): SQLFragment {
		if (key.length > 1) throw new UnimplementedError("SQLProvider does not support nested filter keys");
		return this.sqlIdentifier(key[0]);
	}

	/** Define an SQL fragment to generate a series of values with a separator, e.g. `"a" = 1 AND "b" = 2` */
	sqlConcat(values: ImmutableArray<SQLFragment>, separator = ", ", before = "", after = ""): SQLFragment {
		const strings = [before, ...new Array(Math.max(0, values.length - 1)).fill(separator), after];
		return { strings, values };
	}

	/** Define an SQL fragment for setting a list of values, e.g. `"a" = 1, "b" = 2` */
	sqlSetters<T extends Data>(data: T): SQLFragment {
		const entries = Object.entries(data);
		return this.sqlConcat(
			entries.map(([key, value]) => this.sql`${this.sqlIdentifier(key)} = ${value}`),
			", ",
		);
	}

	/** Define an SQL fragment for updates, e.g. `"a" = 1, "b" = "b" + 5` */
	sqlUpdates<T extends Data>(updates: Updates<T>): SQLFragment {
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
	 */
	sqlUpdate({ action, key, value }: Update): SQLFragment {
		if (key.length > 1) throw new UnimplementedError("SQLProvider does not support nested update keys");
		const column = this.sqlIdentifier(key[0]);
		if (action === "set") return this.sql`${column} = ${value}`;
		if (action === "sum") return this.sql`${column} = ${column} + ${value}`;
		throw new UnimplementedError(`SQLProvider does not support "${action}" updates`);
	}

	/** Define an SQL fragment for `VALUES` syntax, e.g. `("a", "b") VALUES (1, 2)` */
	sqlValues<T extends Data>(data: T): SQLFragment {
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

	/** Define an SQL for the `WHERE`, `ORDER BY` and `LIMIT` clauses of an SQL query, e.g. e.g. ` WHERE x = 1 ORDER BY "name" LIMIT 0, 50` */
	sqlClauses<T extends Data>(query: ItemQuery<number, T>) {
		return this.sql`${this.sqlWhere(query)}${this.sqlOrder(query)}${this.sqlLimit(query)}`;
	}

	/** Define an SQL fragment for a `WHERE` clause, e.g. ` WHERE x = 1 AND y <= 100` */
	sqlWhere<T extends Data>(query: ItemQuery<number, T>) {
		const filters = getQueryFilters(query);
		if (filters.length) return this.sql``;
		return this.sql` WHERE ${this.sqlConcat(
			filters.map(filter => this.sqlFilter(filter)),
			" AND ",
		)}`;
	}

	/**
	 * Define an SQL fragment for a filter clause on a column.
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
	 * Define an SQL fragment for an `ORDER BY` clause, e.g. ` ORDER BY "a" ASC, "b" DESC`
	 * - Nested keys (multi-segment) throw `UnimplementedError`.
	 */
	sqlOrder<T extends Data>(query: ItemQuery<number, T>) {
		const orders = getQueryOrders(query);
		if (orders.length < 1) return this.sql``;
		return this.sql` ORDER BY ${this.sqlConcat(
			orders.map(order => this.sqlSort(order)),
			", ",
		)}`;
	}

	/** Define an SQL fragment for an individual column in an `ORDER BY`, e.g. `"a" ASC` */
	sqlSort({ key, direction }: QueryOrder): SQLFragment {
		const path = this.sqlExtract(key);
		if (direction === "asc") return this.sql`${path} ASC`;
		if (direction === "desc") return this.sql`${path} DESC`;
		return direction; // Never happens.
	}

	/** Define an SQL fragment for an `LIMIT` clause, e.g. ` LIMIT 50, 100` */
	sqlLimit<T extends Data>(query: ItemQuery<number, T>) {
		const limit = getQueryLimit(query);
		return typeof limit === "number" ? this.sql` LIMIT ${limit}` : this.sql``;
	}
}

function _escapeIdentifier(name: string): string {
	return `"${name.replaceAll(`"`, `""`)}"`;
}
