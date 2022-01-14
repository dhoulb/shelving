import { Entry, Data, sortItems, Entries } from "../util/index.js";
import type { Sortable, SortKeys } from "./types.js";
import { Sort } from "./Sort.js";
import { Rules } from "./Rules.js";

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
	rank(left: Entry<T>, right: Entry<T>): number {
		for (const rule of this._rules) {
			const l = rule.rank(left, right);
			if (l !== 0) return l;
		}
		return 0;
	}

	// Implement `Rule`
	transform(iterable: Entries<T>): Entries<T> {
		return this._rules.length ? sortItems(iterable, this) : iterable;
	}
}
