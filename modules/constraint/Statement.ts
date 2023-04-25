import type { FilterKey } from "./Filter.js";
import type { Filterable, PossibleFilters } from "./Filters.js";
import type { PossibleSorts, Sortable } from "./Sorts.js";
import type { Data } from "../util/data.js";
import { limitArray } from "../util/array.js";
import { assert } from "../util/assert.js";
import { cloneObjectWith, getProp } from "../util/object.js";
import { Constraint } from "./Constraint.js";
import { Filter } from "./Filter.js";
import { Filters } from "./Filters.js";
import { Sorts } from "./Sorts.js";

// Instances to save resources for the default case (empty query).
const EMPTY_FILTERS = new Filters<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const EMPTY_SORTS = new Sorts<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

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

	/** The maximum number of items allowed by the limit. */
	readonly limit: number | null;

	/** Return a new instance of this class with no limit specified. */
	readonly unlimited: this;

	/** Return a new instance of this class with a limit set. */
	max(max: number | null): this;
}

/** Allows filtering, sorting, and limiting on a set of results. */
export class Statement<T extends Data = Data> extends Constraint<T> implements Queryable<T> {
	readonly filters: Filters<T>;
	readonly sorts: Sorts<T>;
	readonly limit: number | null;

	constructor(filters: PossibleFilters<T> = EMPTY_FILTERS as Filters<T>, sorts: PossibleSorts<T> = EMPTY_SORTS as Sorts<T>, limit: number | null = null) {
		super();
		this.filters = Filters.from<T>(filters);
		this.sorts = Sorts.from<T>(sorts);
		this.limit = limit;
	}

	// Implement `Filterable`
	filter(filters: PossibleFilters<T>): this {
		return cloneObjectWith(this, "filters", this.filters.filter(filters));
	}
	get unfiltered(): this {
		return cloneObjectWith(this, "filters", this.filters.unfiltered);
	}
	match(item: T): boolean {
		return this.filters.match(item);
	}

	// Implement `Sortable`
	sort(sorts: PossibleSorts<T>): this {
		return cloneObjectWith(this, "sorts", this.sorts.sort(sorts));
	}
	get unsorted(): this {
		return cloneObjectWith(this, "sorts", this.sorts.unsorted);
	}
	rank(left: T, right: T): number {
		return this.sorts.rank(left, right);
	}

	// Implement `Queryable`
	after(item: T): this {
		return cloneObjectWith(this, "filters", this.filters.with(..._getAfterFilters(this.sorts, item)));
	}
	before(item: T): this {
		return cloneObjectWith(this, "filters", this.filters.with(..._getBeforeFilters(this.sorts, item)));
	}
	get unlimited(): this {
		return this.max(null);
	}
	max(limit: number | null): this {
		return cloneObjectWith(this, "limit", limit);
	}

	// Implement `Rule`
	transform(items: Iterable<T>): Iterable<T> {
		const sorted = this.sorts.transform(this.filters.transform(items));
		return typeof this.limit === "number" ? limitArray(sorted, this.limit) : sorted;
	}

	// Implement toString()
	override toString(): string {
		return [this.filters.toString(), this.sorts.toString(), typeof this.limit === "number" ? `"limit":${this.limit}` : null].filter(Boolean).join(",");
	}
}

function* _getAfterFilters<T extends Data>(sorts: Sorts<T>, item: T): Iterable<Filter<T>> {
	const lastSort = sorts.last;
	assert(lastSort);
	for (const sort of sorts) {
		const { key, keys, direction } = sort;
		const filterKey = (direction === "ASC" ? (sort === lastSort ? `${key}>` : `${key}>=`) : sort === lastSort ? `${key}<` : `${key}<=`) as FilterKey<T>;
		yield new Filter(filterKey, getProp(item, ...keys));
	}
}

function* _getBeforeFilters<T extends Data>(sorts: Sorts<T>, item: T): Iterable<Filter<T>> {
	const lastSort = sorts.last;
	assert(lastSort);
	for (const sort of sorts) {
		const { key, keys, direction } = sort;
		const filterKey = (direction === "ASC" ? (sort === lastSort ? `${key}<` : `${key}<=`) : sort === lastSort ? `${key}>` : `${key}>=`) as FilterKey<T>;
		yield new Filter(filterKey, getProp(item, ...keys));
	}
}
