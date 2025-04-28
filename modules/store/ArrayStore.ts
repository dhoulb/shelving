import type { ImmutableArray } from "../util/array.js";
import { omitArrayItems, toggleArrayItems, withArrayItems } from "../util/array.js";
import type { NONE } from "../util/constants.js";
import { getFirstItem, getLastItem, requireFirstItem, requireLastItem } from "../util/iterate.js";
import { Store } from "./Store.js";

/** Store an array. */
export class ArrayStore<T> extends Store<ImmutableArray<T>> implements Iterable<T> {
	constructor(value: ImmutableArray<T> | typeof NONE = [], time?: number) {
		super(value, time);
	}

	/** Get the first item in this store or `null` if this query has no items. */
	get optionalFirst(): T | undefined {
		return getFirstItem(this.value);
	}

	/** Get the last item in this store or `null` if this query has no items. */
	get optionalLast(): T | undefined {
		return getLastItem(this.value);
	}

	/** Get the first item in this store. */
	get first(): T {
		return requireFirstItem(this.value);
	}

	/** Get the last item in this store. */
	get last(): T {
		return requireLastItem(this.value);
	}

	/** Does the document have at least one result. */
	get exists(): boolean {
		return !!this.value.length;
	}

	/** Get the length of the current value of this store. */
	get count(): number {
		return this.value.length;
	}

	/** Add items to this array. */
	add(...items: T[]): void {
		this.value = withArrayItems(this.value, ...items);
	}

	/** Remove items from this array. */
	delete(...items: T[]): void {
		this.value = omitArrayItems(this.value, ...items);
	}

	/** Toggle items in this array. */
	toggle(...items: T[]): void {
		this.value = toggleArrayItems(this.value, ...items);
	}

	/** Iterate over the items. */
	[Symbol.iterator](): Iterator<T, void> {
		return this.value.values();
	}
}
