import { Data, getProp, Key } from "../util/data.js";
import type { ArrayType, ImmutableArray } from "../util/array.js";
import { assert } from "../util/assert.js";
import { limitItems } from "../util/iterate.js";
import { Filterable, Filters } from "./Filters.js";
import { Sortable, Sorts } from "./Sorts.js";
import { Rule } from "./Rule.js";
import { Filter, FilterKey, FilterProps } from "./Filter.js";
import { SortKey, SortKeys } from "./Sort.js";

// Instances to save resources for the default case (empty query).
const EMPTY_FILTERS = new Filters<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const EMPTY_SORTS = new Sorts<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

/** Set of props for a query defined as an object. */
export type QueryProps<T extends Data> = FilterProps<T> & {
	readonly sort?: SortKey<T> | ImmutableArray<SortKey<T>>;
	readonly limit?: number | null;
};

/** Interface that combines Filterable, Sortable, Sliceable. */
export interface Queryable<T extends Data> extends Filterable<T>, Sortable<T> {
	/**
	 * Return a new instance of this class with an after offset defined.
	 * - Offset are based on the sort orders the collection's query uses.
	 * - Every key used for sorting (e.g. `date, title` must be defined in `item`
	 *
	 * @throws AssertionError if this query currently has no sort orders.
	 * @throws AssertionError if the input `item` did not contain a sorted value.
	 */
	after(item: T): this;

	/** Return a new instance of this class with a before offset defined. */
	before(item: T): this;

	/** Return a new instance of this class with no filters specified. */
	unfilter: this;

	/** Return a new instance of this class with no sorts specified. */
	unsort: this;

	/** The maximum number of items allowed by the limit. */
	readonly limit: number | null;

	/** Return a new instance of this class with a limit set. */
	max(max: number | null): this;

	/** Return a new instance of this class with new filters, sorts, limits set. */
	query(query: QueryProps<T>): this;
}

/** Allows filtering, sorting, and limiting on a set of results. */
export class Query<T extends Data> extends Rule<T> implements Queryable<T> {
	/** Create a new `Query` object from a set of `QueryProps` */
	static on<X extends Data>({ sort, limit, ...filters }: QueryProps<X>): Query<X> {
		return new Query<X>(filters && Filters.on<X>(filters as FilterProps<X>), sort && Sorts.on<X>(sort), limit);
	}

	readonly filters: Filters<T>;
	readonly sorts: Sorts<T>;
	readonly limit: number | null;
	constructor(filters: Filters<T> = EMPTY_FILTERS, sorts: Sorts<T> = EMPTY_SORTS, limit: number | null = null) {
		super();
		this.filters = filters;
		this.sorts = sorts;
		this.limit = limit;
	}

	// Implement `Filterable`
	filter(props: FilterProps<T>): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}` | `${K}>` | `${K}>=` | `${K}<` | `${K}<=`, value: T[K]): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}`, value: ImmutableArray<T[K]>): this;
	filter<K extends Key<T>>(key: `${K}[]`, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this;
	filter(input: FilterKey<T> | FilterProps<T>, value?: unknown): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			filters: this.filters.filter(input as any, value as any), // eslint-disable-line @typescript-eslint/no-explicit-any
		};
	}
	get unfilter(): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			filters: EMPTY_FILTERS,
		};
	}
	match(item: T): boolean {
		return this.filters.match(item);
	}

	// Implement `Sortable`
	sort(...keys: SortKeys<T>[]): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			sorts: this.sorts.sort(...keys),
		};
	}
	get unsort(): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			sorts: EMPTY_SORTS,
		};
	}
	rank(left: T, right: T): number {
		return this.sorts.rank(left, right);
	}

	// Implement `Queryable`
	after(item: T): this {
		const filters = [...this.filters];
		const lastSort = this.sorts.last;
		assert(lastSort);
		for (const sort of this.sorts) {
			const { key, direction } = sort;
			filters.push(new Filter(key, direction === "ASC" ? (sort === lastSort ? "GT" : "GTE") : sort === lastSort ? "LT" : "LTE", getProp(item, key)));
		}
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			filters: new Filters(...filters),
		};
	}
	before(item: T): this {
		const filters = [...this.filters];
		const lastSort = this.sorts.last;
		assert(lastSort);
		for (const sort of this.sorts) {
			const { key, direction } = sort;
			filters.push(new Filter(key, direction === "ASC" ? (sort === lastSort ? "LT" : "LTE") : sort === lastSort ? "GT" : "GTE", getProp(item, key)));
		}
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			filters: new Filters(...filters),
		};
	}
	max(limit: number | null): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			limit,
		};
	}
	query({ sort, limit, ...filters }: QueryProps<T>): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			filters: this.filters.filter(filters as FilterProps<T>),
			sorts: sort ? this.sorts.sort(sort) : this.sorts,
			limit: limit !== undefined ? limit : this.limit,
		};
	}

	// Implement `Rule`
	transform(items: Iterable<T>): Iterable<T> {
		const sorted = this.sorts.transform(this.filters.transform(items));
		return typeof this.limit === "number" ? limitItems(sorted, this.limit) : sorted;
	}

	// Implement toString()
	override toString(): string {
		const filters = this.filters.toString();
		const sorts = this.sorts.toString();
		return `{${filters}${sorts ? `${filters ? "," : ""}"sort":[${sorts}]` : ""}${typeof this.limit === "number" ? `${filters || sorts ? "," : ""}"limit":${this.limit}` : ""}}`;
	}
}
