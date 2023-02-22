import type { ImmutableArray } from "../util/array.js";
import type { Data, DataKey } from "../util/data.js";
import type { Nullish } from "../util/null.js";
import { rank, Rankable, rankAsc, rankDesc, sortItems } from "../util/sort.js";
import type { Constraint } from "./Constraint.js";

/** Format that allows sorts to be set as a plain string, e.g. `name` sorts by name in ascending order and `!date` sorts by date in descending order. */
export type SortKey<T extends Data> = DataKey<T> | `${DataKey<T>}` | `!${DataKey<T>}`;

/** One or more sort keys. */
export type SortKeys<T extends Data> = SortKey<T> | ImmutableArray<SortKey<T>>;

/** Possible operator references. */
export type SortDirection = "ASC" | "DESC";

/** List of sorts in a flexible format. */
export type SortList<T extends Data> = SortKey<T> | SortConstraint<T> | Iterable<Nullish<SortKey<T> | SortConstraint<T>>>;

/** Sort a list of values. */
export class SortConstraint<T extends Data = Data> implements Constraint<T>, Rankable<T> {
	readonly key: string;
	readonly direction: SortDirection;
	get sortKey(): string {
		return `"${this.direction === "DESC" ? "!" : ""}${this.key}"`;
	}
	constructor(sortKey: SortKey<T>) {
		if (sortKey.startsWith("!")) {
			this.key = sortKey.slice(1);
			this.direction = "DESC";
		} else {
			this.key = sortKey;
			this.direction = "ASC";
		}
	}
	rank(left: T, right: T): number {
		return rank(left[this.key], this.direction === "ASC" ? rankAsc : rankDesc, right[this.key]);
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
