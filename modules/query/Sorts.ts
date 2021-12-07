import { Entry, Data, sortItems, Results } from "../util/index.js";
import type { QueryKey, Sortable } from "./types.js";
import { AscendingSort, DescendingSort, Sort } from "./Sort.js";
import { Rules } from "./Rules.js";

/** A set of sorts. */
export class Sorts<T extends Data> extends Rules<T, Sort<T>> implements Sortable<T> {
	asc(key: QueryKey<T>): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new AscendingSort<T>(key)] };
	}
	desc(key: QueryKey<T>): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new DescendingSort<T>(key)] };
	}
	rank(left: Entry<T>, right: Entry<T>): number {
		for (const rule of this) {
			const l = rule.rank(left, right);
			if (l !== 0) return l;
		}
		return 0;
	}
	transform(iterable: Results<T>): Results<T> {
		return this._rules.length ? sortItems(iterable, this) : iterable;
	}
}
