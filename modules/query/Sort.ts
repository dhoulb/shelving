import type { ImmutableArray } from "../util/array.js";
import type { Data, Key } from "../util/data.js";
import type { Entries, Entry } from "../util/entry.js";
import { rank, Rankable, rankAsc, rankDesc, sortItems } from "../util/sort.js";
import { getQueryProp } from "./util.js";
import { Rule } from "./Rule.js";

/** Format that allows sorts to be set as a plain string, e.g. `name` sorts by name in ascending order and `!date` sorts by date in descending order. */
export type SortKey<T extends Data> = "id" | "!id" | Key<T> | `${Key<T>}` | `!${Key<T>}`;

/** One or more sort keys. */
export type SortKeys<T extends Data> = SortKey<T> | ImmutableArray<SortKey<T>>;

/** Possible operator references. */
export type SortDirection = "ASC" | "DESC";

/** Sort a list of values. */
export class Sort<T extends Data> extends Rule<T> implements Rankable<Entry<T>> {
	/** Create a sort on a specified field. */
	static on<X extends Data>(sort: SortKey<X> | Sort<X>): Sort<X> {
		return sort instanceof Sort ? sort : sort.startsWith("!") ? new Sort<X>(sort.slice(1), "DESC") : new Sort<X>(sort, "ASC");
	}

	readonly key: "id" | Key<T>;
	readonly direction: SortDirection;
	constructor(key: "id" | Key<T>, direction: SortDirection) {
		super();
		this.key = key;
		this.direction = direction;
	}
	rank([leftId, leftData]: Entry<T>, [rightId, rightData]: Entry<T>): number {
		return rank(getQueryProp(leftId, leftData, this.key), this.direction === "ASC" ? rankAsc : rankDesc, getQueryProp(rightId, rightData, this.key));
	}
	transform(iterable: Entries<T>): Entries<T> {
		return sortItems(iterable, this);
	}
	toString(): string {
		return `${this.direction === "DESC" ? "!" : ""}${this.key}`;
	}
}
