import type { StateOptions } from "./State.js";
import type { ImmutableArray } from "../util/array.js";
import { omitArrayItems, toggleArrayItems, withArrayItems } from "../util/array.js";
import { State } from "./State.js";

/** State that stores an array and has additional methods to help with that. */
export class ArrayState<T> extends State<ImmutableArray<T>> implements Iterable<T> {
	constructor(options: StateOptions<ImmutableArray<T>> = {}) {
		super("value" in options ? options : { value: [], ...options });
	}

	/** Get the length of the current value of this state. */
	get count(): number {
		return this.value.length;
	}

	/** Add items to this array. */
	add(...items: T[]): void {
		this.set(withArrayItems(this.value, ...items));
	}

	/** Remove items from this array. */
	delete(...items: T[]): void {
		this.set(omitArrayItems(this.value, ...items));
	}

	/** Toggle items in this array. */
	toggle(...items: T[]): void {
		this.set(toggleArrayItems(this.value, ...items));
	}

	/** Iterate over the items. */
	[Symbol.iterator](): Iterator<T, void> {
		return this.value.values();
	}
}
