import { UnimplementedError } from "../../error/UnimplementedError.js";
import type { ImmutableArray } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import type { Item, Items, OptionalItem } from "../../util/item.js";
import { assertNumber } from "../../util/number.js";
import { type Filter, getFilters, getLimit, getOrders, type ItemQuery } from "../../util/query.js";
import type { Updates } from "../../util/update.js";
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

	protected escapeIdentifier(name: string): unknown {
		return `"${name.replaceAll(`"`, `""`)}"`;
	}

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

	async deleteItem<T extends Data>(c: Collection<string, number, T>, id: number): Promise<void> {
		await this.exec`DELETE FROM ${c} WHERE ${this.sqlIdentifier("id")} = ${id}`;
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
	protected sql(strings: TemplateStringsArray, ...values: ImmutableArray<unknown>): SQLFragment {
		return { strings, values };
	}

	/** Define an SQL fragment for an identifier, e.g. `"myTable"` */
	protected sqlIdentifier(name: string): SQLFragment {
		return { strings: ["", ""], values: [this.escapeIdentifier(name)] };
	}

	/** Define an SQL fragment to generate a series of values with a separator, e.g. `"a" = 1 AND "b" = 2` */
	protected sqlJoin(values: ImmutableArray<unknown>, separator: string = ", "): SQLFragment {
		return {
			strings: ["", ...new Array(values.length).fill(separator), ""],
			values,
		};
	}

	/** Define an SQL fragment for setting a list of values, e.g. `"a" = 1, "b" = 2` */
	protected sqlSetters<T extends Data>(data: T): SQLFragment {
		const entries = Object.entries(data);
		return this.sqlJoin(
			entries.map(([key, value]) => this.sql`${this.sqlIdentifier(key)} = ${value}`),
			", ",
		);
	}

	/** Define an SQL fragment for setting a list of values, e.g. `"a" = 1, "b" = 2` */
	protected sqlUpdates<T extends Data>(updates: Updates<T>): SQLFragment {
		// @todo map our `Updates` type into a series of SQL `a = 123` fragments and join them with `, `
	}

	/** Define an SQL fragment for `VALUES` syntax, e.g. `("a", "b") VALUES (1, 2)` */
	protected sqlValues<T extends Data>(data: T): SQLFragment {
		const entries = Object.entries(data);
		const keys = this.sqlJoin(
			entries.map(([key]) => this.sqlIdentifier(key)),
			", ",
		);
		const values = this.sqlJoin(
			entries.map(([, value]) => this.sql`${value}`),
			", ",
		);
		return this.sql`(${keys}) VALUES (${values})`;
	}

	/** Define an SQL for the `WHERE`, `ORDER BY` and `LIMIT` clauses of an SQL query, e.g. e.g. ` WHERE x = 1 ORDER BY "name" LIMIT 0, 50` */
	protected sqlClauses<T extends Data>(query: ItemQuery<number, T>) {
		return this.sql`${this.sqlWhere(query)}${this.sqlOrder(query)}${this.sqlLimit(query)}`;
	}

	/** Define an SQL fragment for a `WHERE` clause, e.g. ` WHERE x = 1 AND y <= 100` */
	protected sqlWhere<T extends Data>(query: ItemQuery<number, T>) {
		const filters = getFilters(query).map(filter => this.sqlFilter(filter));
		return filters.length ? this.sql` WHERE ${this.sqlFilter}` : this.sql``;
	}

	/** Define an SQL fragment for a filter clause on a column, e.g. `x = 1` or `y <= 100` */
	protected sqlFilter({ key, operator, value }: Filter): SQLFragment {
		const expression = this.sqlIdentifier(key);
		if (operator === "contains") {
			// @todo write this.
		}
		if (operator === "in") {
			if (!value.length) return this.sql`0`;
			return this.sql`${expression} IN (${this.sqlJoin(value.map(value => this.sql`${value}`))})`;
		}
		if (operator === "out") {
			if (!value.length) return this.sql`1`;
			return this.sql`(${expression} IS NULL OR ${expression} NOT IN (${this.sqlJoin(value.map(value => this.sql`${value}`))}))`;
		}
		if (operator === "is") return value === null ? this.sql`${expression} IS NULL` : this.sql`${expression} = ${value}`;
		if (operator === "not")
			return value === null ? this.sql`${expression} IS NOT NULL` : this.sql`(${expression} IS NULL OR ${expression} != ${value})`;
		if (operator === "lt") return this.sql`${expression} < ${value}`;
		if (operator === "lte") return this.sql`${expression} <= ${value}`;
		if (operator === "gt") return this.sql`${expression} > ${value}`;
		if (operator === "gte") return this.sql`${expression} >= ${value}`;
		throw new UnimplementedError(`SQLProvider does not support "${operator}" filter operator`);
	}

	/** Define an SQL fragment for an `ORDER BY` clause, e.g. ` ORDER BY "a" ASC, "b" DESC` */
	protected async sqlOrder<T extends Data>(query: ItemQuery<number, T>) {
		const orders = getOrders(query).map(({ key, direction }) =>
			direction === "asc" ? this.sql`${this.sqlIdentifier(key)} ASC` : this.sql`${this.sqlIdentifier(key)} DESC`,
		);
		return orders.length ? this.sql` ORDER BY ${this.sqlJoin(orders)}` : this.sql``;
	}

	/** Define an SQL fragment for an `LIMIT` clause, e.g. ` LIMIT 50, 100` */
	protected async sqlLimit<T extends Data>(query: ItemQuery<number, T>) {
		const limit = getLimit(query);
		return typeof limit === "number" ? this.sql` LIMIT ${limit}` : this.sql``;
	}
}

function _getItemData<T extends Data>({ id: _id, ...data }: { readonly id: number } & T): T {
	return data as unknown as T;
}
