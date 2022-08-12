import { Data, getProp } from "../util/data.js";
import { assert } from "../util/assert.js";
import { limitItems } from "../util/iterate.js";
import { Filterable, FilterConstraints } from "./FilterConstraints.js";
import { Sortable, SortConstraints } from "./SortConstraints.js";
import { Constraint } from "./Constraint.js";
import { FilterConstraint, FilterList } from "./FilterConstraint.js";
import { SortKeys, SortList } from "./SortConstraint.js";

// Instances to save resources for the default case (empty query).
const EMPTY_FILTERS = new FilterConstraints<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const EMPTY_SORTS = new SortConstraints<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

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
}

/** Allows filtering, sorting, and limiting on a set of results. */
export class QueryConstraints<T extends Data = Data> extends Constraint<T> implements Queryable<T> {
	readonly filters: FilterConstraints<T>;
	readonly sorts: SortConstraints<T>;
	readonly limit: number | null;

	constructor(filters: FilterList<T> = EMPTY_FILTERS, sorts: SortList<T> = EMPTY_SORTS, limit: number | null = null) {
		super();
		this.filters = filters instanceof FilterConstraints ? filters : new FilterConstraints(filters);
		this.sorts = sorts instanceof SortConstraints ? sorts : new SortConstraints(sorts);
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
		if (!this.filters.size) return this;
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
		if (!this.sorts.size) return this;
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
		if (this.limit === limit) return this;
		return {
			__proto__: Object.getPrototypeOf(this),
			...this,
			limit,
		};
	}

	// Implement `Rule`
	transform(items: Iterable<T>): Iterable<T> {
		const sorted = this.sorts.transform(this.filters.transform(items));
		return typeof this.limit === "number" ? limitItems(sorted, this.limit) : sorted;
	}

	// Implement toString()
	override toString(): string {
		return `{"filters":${this.filters.toString()}},"sorts":${this.sorts.toString()},"limit":${this.limit}}`;
	}
}

function* _getAfterFilters<T extends Data>(sorts: SortConstraints<T>, item: T): Iterable<FilterConstraint<T>> {
	const lastSort = sorts.last;
	assert(lastSort);
	for (const sort of sorts) {
		const { key, direction } = sort;
		const filterKey = direction === "ASC" ? (sort === lastSort ? `${key}>` : `${key}>=`) : sort === lastSort ? `${key}<` : `${key}<=`;
		yield new FilterConstraint(filterKey, getProp(item, key));
	}
}

function* _getBeforeFilters<T extends Data>(sorts: SortConstraints<T>, item: T): Iterable<FilterConstraint<T>> {
	const lastSort = sorts.last;
	assert(lastSort);
	for (const sort of sorts) {
		const { key, direction } = sort;
		const filterKey = direction === "ASC" ? (sort === lastSort ? `${key}<` : `${key}<=`) : sort === lastSort ? `${key}>` : `${key}>=`;
		yield new FilterConstraint(filterKey, getProp(item, key));
	}
}