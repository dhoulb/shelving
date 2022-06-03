import type { Data } from "../util/data.js";
import { Rankable, sortItems } from "../util/sort.js";
import { Rules } from "./Rules.js";
import { Sort, SortKeys } from "./Sort.js";

/**
 * Interface to make sure an object implements all directions.
 * - Extends `Matchable` so this object itself can be directly be used in `filterItems()` and `filterEntries()`
 */
export interface Sortable<T extends Data> extends Rankable<T> {
	/** Add one or more sorts to this sortable. */
	sort(...keys: SortKeys<T>[]): this;
}

/** A set of sorts. */
export class Sorts<T extends Data> extends Rules<T, Sort<T>> implements Sortable<T> {
	/** Create a new `Sorts` object from an array of `SortKey` strings. */
	static on<X extends Data>(...keys: SortKeys<X>[]): Sorts<X> {
		return new Sorts<X>(...keys.flat().map(Sort.on));
	}

	// Implement `Sortable`
	sort(...keys: SortKeys<T>[]): this {
		return this.with(...keys.flat().map(Sort.on));
	}
	rank(left: T, right: T): number {
		for (const rule of this._rules) {
			const l = rule.rank(left, right);
			if (l !== 0) return l;
		}
		return 0;
	}

	// Implement `Rule`
	transform(items: Iterable<T>): Iterable<T> {
		return this._rules.length ? sortItems(items, this) : items;
	}
}
