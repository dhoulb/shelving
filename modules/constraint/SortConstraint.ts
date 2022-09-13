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
export type SortList<T extends Data> = Nullish<SortKeys<T> | SortConstraint<T> | Iterable<SortList<T>>>;

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

/** Get the separate sorts generated from a list of sorts. */
export function* getSorts<T extends Data>(sorts: SortList<T>): Iterable<SortConstraint<T>> {
	if (typeof sorts === "string") {
		yield new SortConstraint(sorts);
	} else if (sorts instanceof SortConstraint) {
		yield sorts;
	} else if (sorts) {
		for (const sort of sorts) yield* getSorts(sort);
	}
}
