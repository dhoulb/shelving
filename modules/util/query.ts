import type { ImmutableArray } from "./array.js";
import type { Data, DataProp, FlatData, FlatDataKey } from "./data.js";
import type { Match } from "./match.js";
import type { Mutable } from "./object.js";
import { getLastItem, isArray, limitArray } from "./array.js";
import { isArrayWith, isEqual, isEqualGreater, isEqualLess, isGreater, isInArray, isLess, notEqual, notInArray } from "./equal.js";
import { limitItems } from "./iterate.js";
import { getProp, getProps } from "./object.js";
import { compareAscending, compareDescending, sortArray } from "./sort.js";
import { splitString } from "./string.js";
import { isDefined } from "./undefined.js";

/** Query that can be applied to a list of data objects. */
export type Query<T extends Data> = {
	readonly [K in FlatDataKey<T> as K | `${K}` | `!${K}`]?: FlatData<T>[K] | ImmutableArray<FlatData<T>[K]> | undefined; // is/not/in/out
} & {
	readonly [K in FlatDataKey<T> as `${K}<` | `${K}<=` | `${K}>` | `${K}>=`]?: FlatData<T>[K] | undefined; // gt/gte/lt/lte
} & {
	readonly [K in FlatDataKey<T> as `${K}[]`]?: FlatData<T>[K] extends ImmutableArray<infer X> ? X | undefined : never; // contains
} & {
	readonly $order?: FlatDataKey<T> | `${FlatDataKey<T>}` | `!${FlatDataKey<T>}` | ImmutableArray<`${FlatDataKey<T>}` | `!${FlatDataKey<T>}`>;
	readonly $limit?: number | undefined;
};

/** A single filter that can be applied to a list of data objects. */
export type Filter =
	| { keys: readonly [string, ...string[]]; operator: "is"; value: unknown }
	| { keys: readonly [string, ...string[]]; operator: "not"; value: unknown }
	| { keys: readonly [string, ...string[]]; operator: "in"; value: ImmutableArray }
	| { keys: readonly [string, ...string[]]; operator: "out"; value: ImmutableArray }
	| { keys: readonly [string, ...string[]]; operator: "contains"; value: unknown }
	| { keys: readonly [string, ...string[]]; operator: "lt"; value: unknown }
	| { keys: readonly [string, ...string[]]; operator: "lte"; value: unknown }
	| { keys: readonly [string, ...string[]]; operator: "gt"; value: unknown }
	| { keys: readonly [string, ...string[]]; operator: "gte"; value: unknown };

/** A single sort that can be applied to a list of data objects. */
export type Sort = {
	keys: readonly [string, ...string[]];
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
	return getProps(query).map(_getFilters).filter(isDefined);
}
function _getFilters([key, value]: DataProp<Data>): Filter | undefined {
	if (key === "$order" || key === "$limit") return;
	else if (key.startsWith("!")) return isArray(value) ? { keys: splitString(key.slice(1), "."), operator: "out", value } : { keys: splitString(key.slice(1), "."), operator: "not", value };
	else if (key.endsWith("[]")) return { keys: splitString(key.slice(0, -2), "."), operator: "contains", value };
	else if (key.endsWith(">")) return { keys: splitString(key.slice(0, -1), "."), operator: "gt", value };
	else if (key.endsWith(">=")) return { keys: splitString(key.slice(0, -2), "."), operator: "gte", value };
	else if (key.endsWith("<")) return { keys: splitString(key.slice(0, -1), "."), operator: "lt", value };
	else if (key.endsWith("<=")) return { keys: splitString(key.slice(0, -2), "."), operator: "lte", value };
	else return isArray(value) ? { keys: splitString(key, "."), operator: "in", value } : { keys: splitString(key, "."), operator: "is", value };
}

/** Get the `Sort` objects for a query. */
export function getSorts<T extends Data>({ $order }: Query<T>): ImmutableArray<Sort> {
	return !$order ? [] : isArray($order) ? $order.map(_getSort) : [_getSort($order)];
}
function _getSort(key: string): Sort {
	if (key.startsWith("!")) return { keys: splitString(key.slice(1), "."), direction: "desc" };
	else return { keys: splitString(key, "."), direction: "asc" };
}

/** Get the limit for a query. */
export const getLimit = <T extends Data>({ $limit }: Query<T>): number | undefined => $limit;

/** Query a set of data items using a query. */
export function queryItems<T extends Data>(items: Iterable<T>, query: Query<T>): Iterable<T> {
	return limitQueryItems(sortQueryItems(filterQueryItems(items, getFilters(query)), getSorts(query)), getLimit(query));
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
	for (const { keys, operator, value } of filters) {
		const matcher = MATCHERS[operator] as Match<[unknown, unknown]>;
		if (!matcher(getProp(item, ...keys), value)) return false;
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

/** Compare two data items using a set of sorts. */
export function compareQueryItems<T extends Data>(left: T, right: T, sorts: ImmutableArray<Sort>): number {
	for (const { keys, direction } of sorts) {
		const l = getProp(left, ...keys);
		const r = getProp(right, ...keys);
		const c = direction === "asc" ? compareAscending(l, r) : compareDescending(l, r);
		if (c !== 0) return c;
	}
	return 0;
}

/**  Sort a set of data items using a set of sorts. */
export function sortQueryItems<T extends Data>(items: Iterable<T>, sorts: ImmutableArray<Sort>): Iterable<T> {
	return sorts.length ? sortArray(items, compareQueryItems, sorts) : items;
}

/** LImit a set of data items using a set of limit. */
export function limitQueryItems<T extends Data>(items: ImmutableArray<T> | Iterable<T>, limit: number | undefined): Iterable<T> {
	return typeof limit !== "number" ? items : isArray(items) ? limitArray(items, limit) : limitItems(items, limit);
}

/** Get a query for items that appear before a specified item. */
export function getBeforeQuery<T extends Data>(query: Query<T>, item: T): Query<T> {
	const sorts = getSorts(query);
	const lastSort = getLastItem(sorts);
	const newQuery: Mutable<Query<Data>> = { ...query };
	for (const sort of sorts) {
		const { keys, direction } = sort;
		const key = keys.join(".");
		const value = getProp(item, ...keys);
		newQuery[direction === "asc" ? (sort === lastSort ? `${key}>` : `${key}>=`) : sort === lastSort ? `${key}<` : `${key}<=`] = value;
	}
	return newQuery as Query<T>;
}

/** Get a query for items that appear after a specified item. */
export function getAfterQuery<T extends Data>(query: Query<T>, item: T): Query<T> {
	const sorts = getSorts(query);
	const lastSort = getLastItem(sorts);
	const newQuery: Mutable<Query<Data>> = { ...query };
	for (const sort of sorts) {
		const { keys, direction } = sort;
		const key = keys.join(".");
		const value = getProp(item, ...keys);
		newQuery[direction === "asc" ? (sort === lastSort ? `${key}<` : `${key}<=`) : sort === lastSort ? `${key}>` : `${key}>=`] = value;
	}
	return newQuery as Query<T>;
}
