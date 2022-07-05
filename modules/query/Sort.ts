import type { ImmutableArray } from "../util/array.js";
import { Data, Key, getProp } from "../util/data.js";
import { rank, Rankable, rankAsc, rankDesc, sortItems } from "../util/sort.js";
import { Rule } from "./Rule.js";

/** Format that allows sorts to be set as a plain string, e.g. `name` sorts by name in ascending order and `!date` sorts by date in descending order. */
export type SortKey<T extends Data> = Key<T> | `${Key<T>}` | `!${Key<T>}`;

/** One or more sort keys. */
export type SortKeys<T extends Data> = SortKey<T> | ImmutableArray<SortKey<T>>;

/** Possible operator references. */
export type SortDirection = "ASC" | "DESC";

/** Sort a list of values. */
export class Sort<T extends Data> extends Rule<T> implements Rankable<T> {
	/** Create a sort on a specified field. */
	static on<X extends Data>(sort: SortKey<X> | Sort<X>): Sort<X> {
		return sort instanceof Sort ? sort : sort.startsWith("!") ? new Sort<X>(sort.slice(1), "DESC") : new Sort<X>(sort, "ASC");
	}

	readonly key: Key<T>;
	readonly direction: SortDirection;
	constructor(key: Key<T>, direction: SortDirection) {
		super();
		this.key = key;
		this.direction = direction;
	}
	rank(left: T, right: T): number {
		return rank(getProp(left, this.key), this.direction === "ASC" ? rankAsc : rankDesc, getProp(right, this.key));
	}
	transform(items: Iterable<T>): Iterable<T> {
		return sortItems(items, this);
	}
	toString(): string {
		return `"${this.direction === "DESC" ? "!" : ""}${this.key}"`;
	}
}
