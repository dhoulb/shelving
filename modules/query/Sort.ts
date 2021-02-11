import { Data } from "../data";
import { Entry, ImmutableEntries } from "../entry";
import { getProp } from "../object";
import { DIRECTIONS, Direction, sort, CompareFunction } from "../sort";
import { Rule } from "./Rule";

/**
 * Sorts a list of values.
 *
 * @param prop The name of a property of objects in this collection, or `id` to sort by primary key.
 * @param direction A direction string, either "asc" or "desc"
 */
export class Sort<T extends Data> extends Rule<T> {
	readonly key: "id" | keyof T;
	readonly direction: Direction;

	constructor(key: "id" | keyof T, direction: Direction = "asc") {
		super();
		this.key = key;
		this.direction = direction;
	}

	/** Compare two entries of this type for sorting. */
	compare(left: Entry<T>, right: Entry<T>): number {
		return this.key === "id"
			? DIRECTIONS[this.direction](left[0], right[0])
			: DIRECTIONS[this.direction](getProp(left[1], this.key), getProp(right[1], this.key));
	}

	// Override to call `sort()` on the entries with a custom compare function.
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!entries.length) return entries;
		return sort(entries, (this._compareFunction ||= this.compare.bind(this)));
	}
	private _compareFunction?: CompareFunction<Entry<T>>; // Store the created compare function so it's not recreated on every `apply()` call.

	// Implement toString()
	toString(): string {
		return `${this.key}:${this.direction}`;
	}
}
