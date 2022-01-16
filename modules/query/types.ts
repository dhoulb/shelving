import type { Data, Key, Matchable, Entry, Rankable, ImmutableArray, ArrayType } from "../util/index.js";

/** Possible operator references. */
export type FilterOperator = "IS" | "NOT" | "IN" | "OUT" | "CONTAINS" | "LT" | "LTE" | "GT" | "GTE";

/** Format that allows filters to be specified as a string, e.g. `!name` means `name is not` and `age>` means `age is more than` and `tags[]` means `tags array contains` */
export type FilterKey<T extends Data> = "id" | "!id" | "id>" | "id>=" | "id<" | "id<=" | Key<T> | `${Key<T>}` | `!${Key<T>}` | `${Key<T>}[]` | `${Key<T>}<` | `${Key<T>}<=` | `${Key<T>}>` | `${Key<T>}>=`;

/** Format that allows multiple filters to be specified as a plain object. */
export type FilterProps<T extends Data> = {
	"id"?: string | ImmutableArray<string>;
	"!id"?: string | ImmutableArray<string>;
	"id>"?: string;
	"id>="?: string;
	"id<"?: string;
	"id<="?: string;
} & {
	[K in Key<T> as `${K}` | `!${K}`]?: T[K] | ImmutableArray<T[K]>; // IS/NOT/IN/OUT
} & {
	[K in Key<T> as `${K}[]`]?: T[K] extends ImmutableArray ? ArrayType<T[K]> : never; // CONTAINS
} & {
	[K in Key<T> as `${K}<` | `${K}<=` | `${K}>` | `${K}>=`]?: T[K]; // GT/GTE/LT/LTE
};

/**
 * Interface to make sure an object implements all matchers.
 * - Extends `Matchable` so this object itself can be directly be used in `filterItems()` and `filterEntries()`
 */
export interface Filterable<T extends Data> extends Matchable<Entry<T>, void> {
	/** Add a filter to this filterable. */
	filter(props: FilterProps<T>): this;
	filter(key: "id" | "!id" | "id>" | "id>=" | "id<" | "id<=", value: string): this;
	filter(key: "id" | "!id", value: ImmutableArray<string>): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}` | `${K}>` | `${K}>=` | `${K}<` | `${K}<=`, value: T[K]): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}`, value: ImmutableArray<string>): this;
	filter<K extends Key<T>>(key: `${K}[]`, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this;

	/** Match an entry against the filters specified for this object. */
	match(entry: Entry<T>): boolean;
}

/** Format that allows sorts to be set as a plain string, e.g. `name` sorts by name in ascending order and `!date` sorts by date in descending order. */
export type SortKey<T extends Data> = "id" | "!id" | Key<T> | `${Key<T>}` | `!${Key<T>}`;

/** One or more sort keys. */
export type SortKeys<T extends Data> = SortKey<T> | ImmutableArray<SortKey<T>>;

/** Possible operator references. */
export type SortDirection = "ASC" | "DESC";

/**
 * Interface to make sure an object implements all directions.
 * - Extends `Matchable` so this object itself can be directly be used in `filterItems()` and `filterEntries()`
 */
export interface Sortable<T extends Data> extends Rankable<Entry<T>> {
	/** Add one or more sorts to this sortable. */
	sort(...keys: SortKeys<T>[]): this;
}

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

	/** Return a new instance of this class with no filters specified. */
	unfilter: this;

	/** Return a new instance of this class with no sorts specified. */
	unsort: this;
}
