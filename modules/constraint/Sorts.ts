import type { Data } from "../util/data.js";
import { ImmutableArray, clearArray } from "../util/array.js";
import { cloneObjectWith } from "../util/object.js";
import { Rankable, sortItems } from "../util/sort.js";
import { Constraints } from "./Constraints.js";
import { Sort, SortKey } from "./Sort.js";

/** A possible set of sorts. */
export type PossibleSorts<T extends Data> = Sorts<T> | SortKey<T> | Iterable<SortKey<T>> | ImmutableArray<SortKey<T>>;

/** Turn `SortList` into array of list of `Sort` instances. */
export function* getSorts<T extends Data>(sorts: PossibleSorts<T>): Iterable<Sort<T>> {
	if (sorts instanceof Sorts) {
		yield* sorts;
	} else if (typeof sorts === "string") {
		yield new Sort(sorts);
	} else {
		for (const sort of sorts) yield new Sort(sort);
	}
}

/** An object that is sortable. */
export interface Sortable<T extends Data> extends Rankable<T> {
	/** Add one or more sorts to this sortable. */
	sort(sorts: PossibleSorts<T>): this;
	/** Return a new instance of this class with no sorts specified. */
	unsorted: this;
}

/** A set of sorts. */
export class Sorts<T extends Data = Data> extends Constraints<T, Sort<T>> implements Sortable<T> {
	static from<X extends Data>(sorts: PossibleSorts<X>): Sorts<X> {
		return sorts instanceof Sorts ? sorts : new Sorts(...getSorts(sorts));
	}

	// Implement `Sortable`
	sort(sorts: PossibleSorts<T>): this {
		return this.with(...getSorts(sorts));
	}
	get unsorted(): this {
		return cloneObjectWith(this, "_constraints", clearArray(this._constraints));
	}
	rank(left: T, right: T): number {
		for (const rule of this._constraints) {
			const l = rule.rank(left, right);
			if (l !== 0) return l;
		}
		return 0;
	}

	// Implement `Rule`
	transform(items: Iterable<T>): Iterable<T> {
		return this._constraints.length ? sortItems(items, this) : items;
	}

	// Stringify as array syntax.
	toString(): string {
		return this._constraints.length ? `"sorts":[${this._constraints.map(String).join(",")}]` : "";
	}
}
