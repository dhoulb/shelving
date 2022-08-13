import type { Data } from "../util/data.js";
import type { Matchable } from "../util/match.js";
import { filterItems } from "../util/filter.js";
import { FilterList, FilterConstraint, getFilters } from "./FilterConstraint.js";
import { Constraints } from "./Constraints.js";

/**
 * Interface to make sure an object implements all matchers.
 * - Extends `Matchable` so this object itself can be directly be used in `filterItems()` and `filterEntries()`
 */
export interface Filterable<T extends Data> extends Matchable<T, void> {
	/** Add a filter to this filterable. */
	filter(...filters: FilterList<Partial<T>>[]): this;

	/** Match an item against the filters specified for this object. */
	match(item: T): boolean;
}

/** A set of filters. */
export class FilterConstraints<T extends Data = Data> extends Constraints<T, FilterConstraint<Partial<T>>> implements Filterable<T> {
	constructor(...filters: FilterList<Partial<T>>[]) {
		super(...getFilters(filters));
	}

	// Implement `Filterable`
	filter(...filters: FilterList<Partial<T>>[]): this {
		return this.with(...getFilters(filters));
	}
	match(item: T): boolean {
		for (const rule of this._constraints) if (!rule.match(item)) return false;
		return true;
	}

	// Implement `Rule`
	transform(items: Iterable<T>): Iterable<T> {
		return this._constraints.length ? filterItems(items, this) : items;
	}

	// Stringify as object syntax.
	toString(): string {
		return `{${this._constraints.map(String).join(",")}`;
	}
}
