import type { Entry, ImmutableEntries } from "../entry";
import type { Data } from "../data";
import { sort, Comparer } from "../sort";
import type { Sortable } from "./types";
import { Sort } from "./Sort";
import { Rules } from "./Rules";

/** A set of sorts. */
export class Sorts<T extends Data> extends Rules<T, Sort<T>> implements Sortable<T> {
	// Add sorts.
	asc(key: "id" | keyof T): this {
		return { __proto__: Sorts.prototype, ...this, rules: [...this.rules, new Sort<T>(key, "asc")] };
	}
	desc(key: "id" | keyof T): this {
		return { __proto__: Sorts.prototype, ...this, rules: [...this.rules, new Sort<T>(key, "desc")] };
	}

	/** Compare two entries of this type for sorting. */
	compare(left: Entry<T>, right: Entry<T>): number {
		for (const rule of this.rules) {
			const l = rule.compare(left, right);
			if (l !== 0) return l;
		}
		return 0;
	}

	// Override to sort by all child `Sort` instances with a single compare function.
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!this.rules.length || !entries.length) return entries;
		return sort(entries, (this._compareFunction ||= this.compare.bind(this)));
	}
	private _compareFunction?: Comparer<Entry<T>>; // Store the created compare function so it's not recreated on every `apply()` call.
}
