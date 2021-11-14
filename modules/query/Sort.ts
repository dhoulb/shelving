import { Data, Entry, ImmutableEntries, sort, Comparable, compareAscending, compareDescending } from "../util/index.js";
import { getQueryProp } from "./helpers.js";
import { Rule } from "./Rule.js";
import { SortDirection } from "./types.js";

/** Sort a list of values. */
export abstract class Sort<T extends Data> extends Rule<T> implements Comparable<Entry<T>> {
	readonly key: "id" | string;
	abstract readonly direction: SortDirection;

	constructor(key: "id" | string) {
		super();
		this.key = key;
	}

	// Implement `Comparable`
	abstract compare([leftId, leftData]: Entry<T>, [rightId, rightData]: Entry<T>): number;

	// Override to call `sort()` on the entries with a custom compare function.
	override queryEntries(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		return sort(entries, this);
	}

	// Implement toString()
	override toString(): string {
		return `${this.key}:sort=${this.direction}`;
	}
}

/** Sort a list of values in ascending order. */
export class AscendingSort<T extends Data> extends Sort<T> {
	readonly direction = "ASC";
	compare([leftId, leftData]: Entry<T>, [rightId, rightData]: Entry<T>): number {
		return compareAscending(getQueryProp(leftId, leftData, this.key), getQueryProp(rightId, rightData, this.key));
	}
}

/** Sort a list of values in descending order. */
export class DescendingSort<T extends Data> extends Sort<T> {
	readonly direction = "DESC";
	compare([leftId, leftData]: Entry<T>, [rightId, rightData]: Entry<T>): number {
		return compareDescending(getQueryProp(leftId, leftData, this.key), getQueryProp(rightId, rightData, this.key));
	}
}
