import { Data, Entry, ReadonlyEntries, Keys, getProp, directions, Direction, sort, CompareFunction } from "shelving/tools";
import { Rule } from "./Rule";

/**
 * Sorts a list of values.
 *
 * @param prop The name of a property of objects in this collection, or `id` to sort by primary key.
 * @param direction A direction string, either "asc" or "desc"
 */
export class Sort<D extends Data = Data, K extends "id" | Keys<D> = "id" | Keys<D>> extends Rule<D> {
	readonly key: K;
	readonly direction: Direction;

	constructor(key: K, direction: Direction = "asc") {
		super();
		this.key = key;
		this.direction = direction;
	}

	/** Compare two entries of this type for sorting. */
	compare(left: Entry<D>, right: Entry<D>): number {
		return this.key === "id"
			? directions[this.direction](left[0], right[0])
			: directions[this.direction](getProp(left[1], this.key), getProp(right[1], this.key));
	}

	// Override to call `sort()` on the entries with a custom compare function.
	apply(entries: ReadonlyEntries<D>): ReadonlyEntries<D> {
		if (!entries.length) return entries;
		return sort(entries, (this._compareFunction ||= this.compare.bind(this)));
	}
	private _compareFunction?: CompareFunction<Entry<D>>; // Store the created compare function so it's not recreated on every `apply()` call.

	// Implement toString()
	toString(): string {
		return `${this.key}:${this.direction}`;
	}
}
