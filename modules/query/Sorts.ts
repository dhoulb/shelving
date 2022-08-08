import type { Data } from "../util/data.js";
import { Rankable, sortItems } from "../util/sort.js";
import { Rules } from "./Rules.js";
import { getSorts, Sort, SortKeys, SortList } from "./Sort.js";

/**
 * Interface to make sure an object implements all directions.
 * - Extends `Rankable` so this object itself can be directly be used with `filterItems()` and `filterEntries()`
 */
export interface Sortable<T extends Data> extends Rankable<T> {
	/** Add one or more sorts to this sortable. */
	sort(...keys: SortKeys<T>[]): this;
}

/** A set of sorts. */
export class Sorts<T extends Data> extends Rules<T, Sort<T>> implements Sortable<T> {
	constructor(...sorts: SortList<T>[]) {
		super(...getSorts(sorts));
	}

	// Implement `Sortable`
	sort(...sorts: SortList<T>[]): this {
		return this.with(...getSorts(sorts));
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

	// Stringify as array syntax.
	toString(): string {
		return `[${this._rules.map(String).join(",")}]`;
	}
}
