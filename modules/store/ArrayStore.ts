import type { ImmutableArray } from "../util/array.js";
import { omitArrayItems, toggleArrayItems, withArrayItems } from "../util/array.js";
import { Store } from "./Store.js";

/** Store an array. */
export class ArrayStore<T> extends Store<ImmutableArray<T>> implements Iterable<T> {
	constructor(value: ImmutableArray<T> = [], time?: number) {
		super(value, time);
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
