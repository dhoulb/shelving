import type { ImmutableArray } from "./array.js";
import { isArray, limitArray, requireLast } from "./array.js";
import type { Data, DataPath, LeafData, LeafDataKey } from "./data.js";
import { getDataProp, joinDataKey, splitDataKey } from "./data.js";
import { isArrayWith, isEqual, isEqualGreater, isEqualLess, isGreater, isInArray, isLess, notEqual, notInArray } from "./equal.js";
import type { Match } from "./filter.js";
import type { Identifier, Item } from "./item.js";
import { limitItems } from "./iterate.js";
import type { Mutable } from "./object.js";
import { getProps } from "./object.js";
import { compareAscending, compareDescending, sortArray } from "./sort.js";

/** Query that can be applied to a list of data objects. */
export type Query<T extends Data> = {
	readonly [K in LeafDataKey<T> as `${K}` | `!${K}`]?: LeafData<T>[K] | ImmutableArray<LeafData<T>[K]> | undefined; // is/not/in/out
} & {
	readonly [K in LeafDataKey<T> as `${K}<` | `${K}<=` | `${K}>` | `${K}>=`]?: LeafData<T>[K] | undefined; // gt/gte/lt/lte
} & {
	readonly [K in LeafDataKey<T> as `${K}[]`]?: LeafData<T>[K] extends ImmutableArray<infer X> ? X | undefined : never; // contains
} & {
	readonly $order?:
		| `${LeafDataKey<T>}`
		| `!${LeafDataKey<T>}`
		| undefined
		| ImmutableArray<`${LeafDataKey<T>}` | `!${LeafDataKey<T>}` | undefined>;
	readonly $limit?: number | undefined;
};

/** A set of query constraints for item data. */
export type ItemQuery<I extends Identifier, T extends Data> = Query<Item<I, T>>;

/** A single filter that can be applied to a list of data objects. */
export type Filter =
	| { key: DataPath; operator: "is"; value: unknown }
	| { key: DataPath; operator: "not"; value: unknown }
	| { key: DataPath; operator: "in"; value: ImmutableArray }
	| { key: DataPath; operator: "out"; value: ImmutableArray }
	| { key: DataPath; operator: "contains"; value: unknown }
	| { key: DataPath; operator: "lt"; value: unknown }
	| { key: DataPath; operator: "lte"; value: unknown }
	| { key: DataPath; operator: "gt"; value: unknown }
	| { key: DataPath; operator: "gte"; value: unknown };

/** A single sort order that can be applied to a list of data objects. */
export type Order = {
	key: DataPath;
	direction: "asc" | "desc";
};

/** Map `Filter` operators to corresponding `Match` function. */
const MATCHERS: {
	[T in Filter as T["operator"]]: Match<[unknown, T["value"]]>;
} = {
	is: isEqual,
	not: notEqual,
	in: isInArray,
	out: notInArray,
	contains: isArrayWith,
	lt: isLess,
	lte: isEqualLess,
	gt: isGreater,
	gte: isEqualGreater,
};

/** Get the `Filter` objects for a query. */
export function getFilters<T extends Data>(query: Query<T>): ImmutableArray<Filter> {
	return Array.from(yieldFilters(query));
}
function* yieldFilters<T extends Data>(query: Query<T>): Iterable<Filter> {
	for (const [key, value] of getProps<Data>(query)) {
		if (key === "$order" || key === "$limit" || value === undefined) continue;
		if (key.startsWith("!"))
			yield isArray(value)
				? { key: splitDataKey(key.slice(1)), operator: "out", value }
				: { key: splitDataKey(key.slice(1)), operator: "not", value };
		else if (key.endsWith("[]")) yield { key: splitDataKey(key.slice(0, -2)), operator: "contains", value };
		else if (key.endsWith(">")) yield { key: splitDataKey(key.slice(0, -1)), operator: "gt", value };
		else if (key.endsWith(">=")) yield { key: splitDataKey(key.slice(0, -2)), operator: "gte", value };
		else if (key.endsWith("<")) yield { key: splitDataKey(key.slice(0, -1)), operator: "lt", value };
		else if (key.endsWith("<=")) yield { key: splitDataKey(key.slice(0, -2)), operator: "lte", value };
		else yield isArray(value) ? { key: splitDataKey(key), operator: "in", value } : { key: splitDataKey(key), operator: "is", value };
	}
}

/** Get the `Order` objects for a query. */
export function getOrders<T extends Data>({ $order }: Query<T>): ImmutableArray<Order> {
	return Array.from(yieldOrders($order));
}
function* yieldOrders(order: string | ImmutableArray<string | undefined> | undefined): Iterable<Order> {
	for (const key of isArray(order) ? order : [order]) {
		if (key === undefined) continue;
		if (key.startsWith("!")) yield { key: splitDataKey(key.slice(1)), direction: "desc" };
		else yield { key: splitDataKey(key), direction: "asc" };
	}
}

/** Get the limit for a query. */
export function getLimit<T extends Data>({ $limit }: Query<T>): number | undefined {
	return $limit;
}

/** Query a set of data items using a query. */
export function queryItems<T extends Data>(items: Iterable<T>, query: Query<T>): Iterable<T> {
	return limitQueryItems(sortQueryItems(filterQueryItems(items, getFilters(query)), getOrders(query)), getLimit(query));
}

/**
 * Query a set of data items for writing using a query.
 * - If no limit is set on the data sorting can be avoided too for performance reasons.
 */
export function queryWritableItems<T extends Data>(items: Iterable<T>, query: Query<T>): Iterable<T> {
	return getLimit(query) === undefined ? filterQueryItems(items, getFilters(query)) : queryItems(items, query);
}

/** Match a single data item againt a set of filters. */
export function matchQueryItem<T extends Data>(item: T, filters: ImmutableArray<Filter>): boolean {
	for (const { key, operator, value } of filters) {
		const matcher = MATCHERS[operator] as Match<[unknown, unknown]>;
		if (!matcher(getDataProp(item, key), value)) return false;
	}
	return true;
}

/**  Filter a set of data items using a set of filters. */
export function* filterQueryItems<T extends Data>(items: Iterable<T>, filters: ImmutableArray<Filter>): Iterable<T> {
	if (filters.length) {
		for (const item of items) if (matchQueryItem(item, filters)) yield item;
	} else {
		yield* items;
	}
}

/** Compare two data items using a set of orders. */
export function compareQueryItems<T extends Data>(left: T, right: T, orders: ImmutableArray<Order>): number {
	for (const { key, direction } of orders) {
		const l = getDataProp(left, key);
		const r = getDataProp(right, key);
		const c = direction === "asc" ? compareAscending(l, r) : compareDescending(l, r);
		if (c !== 0) return c;
	}
	return 0;
}

/**  Sort a set of data items using a set of orders. */
export function sortQueryItems<T extends Data>(items: Iterable<T>, orders: ImmutableArray<Order>): Iterable<T> {
	return orders.length ? sortArray(items, compareQueryItems, orders) : items;
}

/** LImit a set of data items using a set of limit. */
export function limitQueryItems<T extends Data>(items: ImmutableArray<T> | Iterable<T>, limit: number | undefined): Iterable<T> {
	return typeof limit !== "number" ? items : isArray(items) ? limitArray(items, limit) : limitItems(items, limit);
}

/**
 * Get a query for items that appear before a specified item.
 * - For token based pagination on a result set.
 */
export function getBeforeQuery<T extends Data>(query: Query<T>, item: T): Query<T> {
	const sorts = getOrders(query);
	const lastSort = requireLast(sorts);
	const newQuery: Mutable<Query<Data>> = { ...query };
	for (const sort of sorts) {
		const { key, direction } = sort;
		const keyStr = joinDataKey(key);
		const value = getDataProp(item, key);
		newQuery[direction === "asc" ? (sort === lastSort ? `${keyStr}>` : `${keyStr}>=`) : sort === lastSort ? `${keyStr}<` : `${keyStr}<=`] =
			value;
	}
	return newQuery as Query<T>;
}

/**
 * Get a query for items that appear after a specified item.
 * - For token based pagination on a result set.
 */
export function getAfterQuery<T extends Data>(query: Query<T>, item: T): Query<T> {
	const sorts = getOrders(query);
	const lastSort = requireLast(sorts);
	const newQuery: Mutable<Query<Data>> = { ...query };
	for (const sort of sorts) {
		const { key, direction } = sort;
		const keyStr = joinDataKey(key);
		const value = getDataProp(item, key);
		newQuery[direction === "asc" ? (sort === lastSort ? `${keyStr}<` : `${keyStr}<=`) : sort === lastSort ? `${keyStr}>` : `${keyStr}>=`] =
			value;
	}
	return newQuery as Query<T>;
}
