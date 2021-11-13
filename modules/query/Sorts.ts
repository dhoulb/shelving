import { Entry, ImmutableEntries, Data, sort, bindMethod } from "../util/index.js";
import type { Sortable } from "./types.js";
import { Sort } from "./Sort.js";
import { Rules } from "./Rules.js";

/** A set of sorts. */
export class Sorts<T extends Data> extends Rules<T, Sort<T>> implements Sortable<T> {
	// Add sorts.
	asc(key: "id" | (keyof T & string)): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new Sort<T>(key, "ASC")] };
	}
	desc(key: "id" | (keyof T & string)): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new Sort<T>(key, "DESC")] };
	}

	/** Compare two entries of this type for sorting. */
	compare(left: Entry<T>, right: Entry<T>): number {
		for (const rule of this.rules) {
			const l = rule.compare(left, right);
			if (l !== 0) return l;
		}
		return 0;
	}

	/** Return a bound `Comparer` function for using in `sort()` */
	@bindMethod
	comparer(left: Entry<T>, right: Entry<T>): number {
		return this.compare(left, right);
	}

	// Override to sort by all child `Sort` instances with a single compare function.
	override queryEntries(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!this.rules.length || !entries.length) return entries;
		return sort(entries, this.comparer);
	}
}
