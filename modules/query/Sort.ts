import { bindMethod } from "../class";
import type { Data } from "../data";
import type { Entry, ImmutableEntries } from "../entry";
import { COMPARE, Direction, sort } from "../sort";
import { getQueryProp } from "./helpers";
import { Rule } from "./Rule";

/**
 * Sorts a list of values.
 *
 * @param prop The name of a property of objects in this collection, or `id` to sort by primary key.
 * @param direction A direction string, either "asc" or "desc"
 */
export class Sort<T extends Data> extends Rule<T> {
	readonly key: "id" | string;
	readonly direction: Direction;

	constructor(key: "id" | string, direction: Direction = "asc") {
		super();
		this.key = key;
		this.direction = direction;
	}

	/** Compare two entries of this type for sorting. */
	@bindMethod // Bind this so we can use it directly in `sort()`
	comparer([leftId, leftData]: Entry<T>, [rightId, rightData]: Entry<T>): number {
		return COMPARE[this.direction](getQueryProp(leftId, leftData, this.key), getQueryProp(rightId, rightData, this.key));
	}

	// Override to call `sort()` on the entries with a custom compare function.
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!entries.length) return entries;
		return sort(entries, this.comparer);
	}

	// Implement toString()
	toString(): string {
		return `${this.key}:sort=${this.direction}`;
	}
}
