import { Data, getProp } from "../util/data.js";
import { assert } from "../util/assert.js";
import { limitItems } from "../util/iterate.js";
import { Filterable, Filters } from "./Filters.js";
import { Sortable, Sorts } from "./Sorts.js";
import { Rule } from "./Rule.js";
import { Filter, FilterList } from "./Filter.js";
import { SortKeys, SortList } from "./Sort.js";

/** Set of props for a query defined as an object. */
export type QueryProps<T extends Data> = {
	readonly filter?: FilterList<T>;
	readonly sort?: SortList<T>;
	readonly limit?: number | null;
};

// Instances to save resources for the default case (empty query).
const EMPTY_FILTERS = new Filters<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const EMPTY_SORTS = new Sorts<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const EMPTY_PROPS: QueryProps<any> = { filter: EMPTY_FILTERS, sort: EMPTY_SORTS, limit: null }; // eslint-disable-line @typescript-eslint/no-explicit-any

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
	readonly unfilter: this;

	/** Return a new instance of this class with no sorts specified. */
	readonly unsort: this;

	/** The maximum number of items allowed by the limit. */
	readonly limit: number | null;

	/** Return a new instance of this class with a limit set. */
	max(max: number | null): this;

	/** Return a new instance of this class with new filters, sorts, limits set. */
	query(query: QueryProps<T>): this;
}

/** Allows filtering, sorting, and limiting on a set of results. */
export class Query<T extends Data> extends Rule<T> implements Queryable<T> {
	readonly filters: Filters<T>;
	readonly sorts: Sorts<T>;
	readonly limit: number | null;

	constructor({ filter = EMPTY_FILTERS, sort = EMPTY_SORTS, limit = null }: QueryProps<T> = EMPTY_PROPS) {
		super();
		this.filters = filter instanceof Filters ? filter : new Filters(filter);
		this.sorts = sort instanceof Sorts ? sort : new Sorts(sort);
		this.limit = limit;
	}

	// Implement `Filterable`
	filter(...filters: FilterList<T>[]): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			filters: this.filters.filter(...filters),
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
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			filters: this.filters.with(..._getAfterFilters(this.sorts, item)),
		};
	}
	before(item: T): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			filters: this.filters.with(..._getBeforeFilters(this.sorts, item)),
		};
	}
	max(limit: number | null): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			limit,
		};
	}
	query({ sort, limit, filter }: QueryProps<T>): this {
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			filters: filter ? this.filters.filter(filter) : this.filters,
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
		return `{"filter":${this.filters.toString()}},"sort":${this.sorts.toString()},"limit":${this.limit}}`;
	}
}

function* _getAfterFilters<T extends Data>(sorts: Sorts<T>, item: T): Iterable<Filter<T>> {
	const lastSort = sorts.last;
	assert(lastSort);
	for (const sort of sorts) {
		const { key, direction } = sort;
		const filterKey = direction === "ASC" ? (sort === lastSort ? `${key}>` : `${key}>=`) : sort === lastSort ? `${key}<` : `${key}<=`;
		yield new Filter(filterKey, getProp(item, key));
	}
}

function* _getBeforeFilters<T extends Data>(sorts: Sorts<T>, item: T): Iterable<Filter<T>> {
	const lastSort = sorts.last;
	assert(lastSort);
	for (const sort of sorts) {
		const { key, direction } = sort;
		const filterKey = direction === "ASC" ? (sort === lastSort ? `${key}<` : `${key}<=`) : sort === lastSort ? `${key}>` : `${key}>=`;
		yield new Filter(filterKey, getProp(item, key));
	}
}
