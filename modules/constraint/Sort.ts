import type { Data, FlatDataKey } from "../util/data.js";
import { getProp } from "../util/object.js";
import { rank, Rankable, rankAsc, rankDesc, sortItems } from "../util/sort.js";
import { splitString } from "../util/string.js";
import { Constraint } from "./Constraint.js";

/** Format that allows sorts to be set as a plain string, e.g. `name` sorts by name in ascending order and `!date` sorts by date in descending order. */
export type SortKey<T extends Data> = FlatDataKey<T> | `${FlatDataKey<T>}` | `!${FlatDataKey<T>}`;

/** Possible operator references. */
export type SortDirection = "ASC" | "DESC";

/** Sort a list of values. */
export class Sort<T extends Data = Data> extends Constraint<T> implements Rankable<T> {
	readonly keys: readonly [string, ...string[]];
	readonly direction: SortDirection;
	get key(): string {
		return this.keys.join(".");
	}
	get sortKey(): string {
		return `"${this.direction === "DESC" ? "!" : ""}${this.key}"`;
	}
	constructor(sortKey: SortKey<T>);
	constructor(sortKey: string) {
		super();
		if (sortKey.startsWith("!")) {
			this.keys = splitString(sortKey.slice(1), ".");
			this.direction = "DESC";
		} else {
			this.keys = splitString(sortKey, ".");
			this.direction = "ASC";
		}
	}
	rank(left: T, right: T): number {
		return rank(getProp(left, ...this.keys), this.direction === "ASC" ? rankAsc : rankDesc, getProp(right, ...this.keys));
	}
	transform(items: Iterable<T>): Iterable<T> {
		return sortItems(items, this);
	}
	toString(): string {
		return this.sortKey;
	}
}
