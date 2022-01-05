import { Data, Entry, Rankable, rankAscending, rank, rankDesc, sortItems, Entries } from "../util/index.js";
import { getQueryProp } from "./helpers.js";
import { Rule } from "./Rule.js";
import { QueryKey, SortDirection } from "./types.js";

/** Sort a list of values. */
export abstract class Sort<T extends Data> extends Rule<T> implements Rankable<Entry<T>> {
	abstract readonly direction: SortDirection;
	readonly key: QueryKey<T>;
	constructor(key: QueryKey<T>) {
		super();
		this.key = key;
	}
	abstract rank(left: Entry<T>, right: Entry<T>): number;
	transform(iterable: Entries<T>): Entries<T> {
		return sortItems(iterable, this);
	}
	toString(): string {
		return `${this.key}:${this.direction}`;
	}
}

/** Sort a list of values in ascending order. */
export class AscendingSort<T extends Data> extends Sort<T> {
	readonly direction = "ASC";
	rank([leftId, leftData]: Entry<T>, [rightId, rightData]: Entry<T>): number {
		return rank(getQueryProp(leftId, leftData, this.key), rankAscending, getQueryProp(rightId, rightData, this.key));
	}
}

/** Sort a list of values in descending order. */
export class DescendingSort<T extends Data> extends Sort<T> {
	readonly direction = "DESC";
	rank([leftId, leftData]: Entry<T>, [rightId, rightData]: Entry<T>): number {
		return rank(getQueryProp(leftId, leftData, this.key), rankDesc, getQueryProp(rightId, rightData, this.key));
	}
}
