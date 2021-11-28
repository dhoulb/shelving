import { Data, Entry, Rankable, ASC, Ranker, rank, DESC, sortItems, Results } from "../util/index.js";
import { getQueryProp } from "./helpers.js";
import { Rule } from "./Rule.js";
import { QueryKey, SortDirection } from "./types.js";

/** Sort a list of values. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Sort<T extends Data> {
	readonly direction: SortDirection;
	readonly ranker: Ranker<unknown>;
}
export abstract class Sort<T extends Data> extends Rule<T> implements Rankable<Entry<T>> {
	readonly key: QueryKey<T>;
	constructor(key: QueryKey<T>) {
		super();
		this.key = key;
	}
	rank([leftId, leftData]: Entry<T>, [rightId, rightData]: Entry<T>): number {
		return rank(getQueryProp(leftId, leftData, this.key), this.ranker, getQueryProp(rightId, rightData, this.key));
	}
	derive(iterable: Results<T>): Results<T> {
		return sortItems(iterable, this);
	}
	toString(): string {
		return `${this.key}:${this.direction}`;
	}
}

/** Sort a list of values in ascending order. */
export class AscendingSort<T extends Data> extends Sort<T> {}
Object.assign(AscendingSort.prototype, { direction: "ASC", ranker: ASC });

/** Sort a list of values in descending order. */
export class DescendingSort<T extends Data> extends Sort<T> {}
Object.assign(DescendingSort.prototype, { direction: "DESC", ranker: DESC });
