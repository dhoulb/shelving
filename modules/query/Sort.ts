import { Data, Entry, Rankable, rankAsc, rank, sortItems, Entries, rankDesc, Key } from "../util/index.js";
import { getQueryProp } from "./helpers.js";
import { Rule } from "./Rule.js";
import { SortDirection, SortKey } from "./types.js";

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
