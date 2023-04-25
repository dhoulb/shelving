import { Matchable, filterItems } from "../util/match.js";
import { Data, getDataProps } from "../util/data.js";
import { cloneObjectWith } from "../util/object.js";
import { clearArray } from "../util/array.js";
import { Filter, FilterProps } from "./Filter.js";
import { Constraints } from "./Constraints.js";

/** A possible set of filters. */
export type PossibleFilters<T extends Data> = Filters<T> | FilterProps<T>;

/** Turn `FilterProps` into a list of `Filter` instances. */
export function* getFilters<T extends Data>(filters: PossibleFilters<T>): Iterable<Filter<T>> {
	if (filters instanceof Filters) yield* filters;
	else for (const [key, value] of getDataProps(filters)) yield new Filter<T>(key, value);
}

/** An object that is filterable. */
export interface Filterable<T extends Data> extends Matchable<[T]> {
	/** Add a filter to this filterable. */
	filter(filters: PossibleFilters<T>): this;
	/** Return a new instance of this class with no filters specified. */
	unfiltered: this;
	/** Match an item against the filters specified for this object. */
	match(item: T): boolean;
}

/** A set of filters. */
export class Filters<T extends Data = Data> extends Constraints<T, Filter<T>> implements Filterable<T> {
	static from<X extends Data = Data>(filters: PossibleFilters<X>): Filters<X> {
		return filters instanceof Filters ? filters : new Filters<X>(...getFilters(filters));
	}

	// Implement `Filterable`
	filter(filters: PossibleFilters<T>): this {
		return this.with(...getFilters(filters));
	}
	get unfiltered(): this {
		return cloneObjectWith(this, "_constraints", clearArray(this._constraints));
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
