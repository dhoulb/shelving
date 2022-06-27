import type { ArrayType, ImmutableArray } from "../util/array.js";
import type { Data, Key } from "../util/data.js";
import type { Matchable } from "../util/match.js";
import { filterItems } from "../util/filter.js";
import { FilterKey, FilterProps, Filter } from "./Filter.js";
import { Rules } from "./Rules.js";

/**
 * Interface to make sure an object implements all matchers.
 * - Extends `Matchable` so this object itself can be directly be used in `filterItems()` and `filterEntries()`
 */
export interface Filterable<T extends Data> extends Matchable<T, void> {
	/** Add a filter to this filterable. */
	filter(props: FilterProps<T>): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}` | `${K}>` | `${K}>=` | `${K}<` | `${K}<=`, value: T[K]): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}`, value: ImmutableArray<string>): this;
	filter<K extends Key<T>>(key: `${K}[]`, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this;

	/** Match an item against the filters specified for this object. */
	match(item: T): boolean;
}

function* _yieldFilters<T extends Data>(props: FilterProps<T>): Generator<Filter<T>> {
	for (const [key, value] of Object.entries(props)) yield Filter.on<T>(key, value);
}

/** A set of filters. */
export class Filters<T extends Data> extends Rules<T, Filter<T>> implements Filterable<T> {
	/** Create a `Filters` instance from a set of `FilterProps` */
	static on<X extends Data>(filters: FilterProps<X>) {
		return new Filters(..._yieldFilters(filters));
	}

	// Implement `Filterable`
	filter(props: FilterProps<T>): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}` | `${K}>` | `${K}>=` | `${K}<` | `${K}<=`, value: T[K]): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}`, value: ImmutableArray<string>): this;
	filter<K extends Key<T>>(key: `${K}[]`, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this;
	filter(input: FilterKey<T> | FilterProps<T>, value?: unknown): this {
		return typeof input === "string" ? this.with(Filter.on(input, value)) : this.with(..._yieldFilters(input));
	}
	match(item: T): boolean {
		for (const rule of this._rules) if (!rule.match(item)) return false;
		return true;
	}

	// Implement `Rule`
	transform(items: Iterable<T>): Iterable<T> {
		return this._rules.length ? filterItems(items, this) : items;
	}
}
