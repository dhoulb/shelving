import type { Data } from "../util/data.js";
import type { Matchable } from "../util/match.js";
import { filterItems } from "../util/iterate.js";
import { cloneObjectWith } from "../util/object.js";
import { FilterList, FilterConstraint, getFilters } from "./FilterConstraint.js";
import { Constraints } from "./Constraints.js";

/**
 * Interface to make sure an object implements all matchers.
 * - Extends `Matchable` so this object itself can be directly be used in `filterItems()` and `filterEntries()`
 */
export interface Filterable<T extends Data> extends Matchable<[T]> {
	/** Add a filter to this filterable. */
	filter(...filters: FilterList<T>[]): this;
	/** Return a new instance of this class with no filters specified. */
	unfiltered: this;
	/** Match an item against the filters specified for this object. */
	match(item: T): boolean;
}

/** A set of filters. */
export class FilterConstraints<T extends Data = Data> extends Constraints<T, FilterConstraint<T>> implements Filterable<T> {
	constructor(...filters: FilterList<T>[]) {
		super(...getFilters(filters));
	}

	// Implement `Filterable`
	filter(...filters: FilterList<T>[]): this {
		return this.with(...getFilters(filters));
	}
	get unfiltered(): this {
		return this._constraints.length ? this : cloneObjectWith(this, "_constraints", []);
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
		return this._constraints.length ? `"filters":{${this._constraints.map(String).join(",")}}` : "";
	}
}
