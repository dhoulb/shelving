import { Entry, ImmutableEntries, Data, sort, Comparable } from "../util/index.js";
import type { Sortable } from "./types.js";
import { AscendingSort, DescendingSort, Sort } from "./Sort.js";
import { Rules } from "./Rules.js";

/** A set of sorts. */
export class Sorts<T extends Data> extends Rules<T, Sort<T>> implements Sortable<T>, Comparable<Entry<T>> {
	// Add sorts.
	asc(key: "id" | (keyof T & string)): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new AscendingSort<T>(key)] };
	}
	desc(key: "id" | (keyof T & string)): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new DescendingSort<T>(key)] };
	}

	// Implement `Comparable`
	compare(left: Entry<T>, right: Entry<T>): number {
		for (const rule of this.rules) {
			const l = rule.compare(left, right);
			if (l !== 0) return l;
		}
		return 0;
	}

	// Override to sort by all child `Sort` instances with a single compare function.
	override queryEntries(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!this.rules.length || !entries.length) return entries;
		return sort(entries, this);
	}
}
