import type { ArrayType, ImmutableArray, Data, Key, Matchable, Entry, Rankable } from "../util/index.js";

/** Type for a key in a query, either `id` for the unique ID of the document or any other string key that exists in data. */
export type QueryKey<T extends Data> = "id" | Key<T>;

/** Possible operator references. */
export type FilterOperator = "IS" | "NOT" | "IN" | "CONTAINS" | "LT" | "LTE" | "GT" | "GTE";

/**
 * Interface to make sure an object implements all matchers.
 * - Extends `Matchable` so this object itself can be directly be used in `filterItems()` and `filterEntries()`
 */
export interface Filterable<T extends Data> extends Matchable<Entry<T>, void> {
	is<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this;
	not<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this;
	in<K extends QueryKey<T>>(key: K, value: K extends "id" ? readonly string[] : readonly T[K][]): this;
	contains<K extends Key<T>>(key: K, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this;
	lt<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this;
	lte<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this;
	gt<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this;
	gte<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this;
	match(entry: Entry<T>): boolean;
}

/**
 * Interface to make sure an object implements all directions.
 * - Extends `Matchable` so this object itself can be directly be used in `filterItems()` and `filterEntries()`
 */
export interface Sortable<T extends Data> extends Rankable<Entry<T>> {
	/** Return a new instance of this class with an ascending order sort defined. */
	asc(key?: QueryKey<T>): this;
	/** Return a new instance of this class with a descending order sort defined. */
	desc(key?: QueryKey<T>): this;
}

/** Possible operator references. */
export type SortDirection = "ASC" | "DESC";

/** Interface for an object that can have a limit set. */
export interface Limitable {
	/** The maximum number of items allowed by the limit. */
	readonly limit: number | null;
	/** Return a new instance of this class with a limit set. */
	max(max: number | null): this;
}

/** Interface that combines Filterable, Sortable, Sliceable. */
export interface Queryable<T extends Data> extends Filterable<T>, Sortable<T>, Limitable {
	/**
	 * Return a new instance of this class with an after offset defined.
	 * - Offset are based on the sort orders the collection's query uses.
	 * - Every key used for sorting (e.g. `date, title` must be defined in `data`
	 *
	 * @throws AssertionError if this query currently has no sort orders.
	 * @throws AssertionError if the input `data` did not contain a sorted value.
	 */
	after(id: string, data: T): this;
	/** Return a new instance of this class with a before offset defined. */
	before(id: string, data: T): this;
}
