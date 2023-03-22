import { getProp } from "../index.js";
import type { ImmutableArray } from "../util/array.js";
import type { Data, FlatDataKey } from "../util/data.js";
import type { Nullish } from "../util/null.js";
import { rank, Rankable, rankAsc, rankDesc, sortItems } from "../util/sort.js";
import { splitString } from "../util/string.js";
import type { Constraint } from "./Constraint.js";

/** Format that allows sorts to be set as a plain string, e.g. `name` sorts by name in ascending order and `!date` sorts by date in descending order. */
export type SortKey<T extends Data> = FlatDataKey<T> | `${FlatDataKey<T>}` | `!${FlatDataKey<T>}`;

/** One or more sort keys. */
export type SortKeys<T extends Data> = SortKey<T> | ImmutableArray<SortKey<T>>;

/** Possible operator references. */
export type SortDirection = "ASC" | "DESC";

/** List of sorts in a flexible format. */
export type SortList<T extends Data> = SortKey<T> | SortConstraint<T> | Iterable<Nullish<SortKey<T> | SortConstraint<T>>>;

/** Sort a list of values. */
export class SortConstraint<T extends Data = Data> implements Constraint<T>, Rankable<T> {
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

/** Turn `SortList` into array of list of `SortConstraint` instances. */
export function* getSorts<T extends Data>(list: SortList<T> | SortList<T>[]): Iterable<SortConstraint<T>> {
	if (typeof list === "string") {
		yield new SortConstraint(list);
	} else if (list instanceof SortConstraint) {
		yield list;
	} else {
		for (const sort of list) if (sort) yield* getSorts(sort);
	}
}
