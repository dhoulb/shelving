import { ImmutableArray, Resolvable, swapItem, toggleItem, withItem, withoutItem, countItems, LOADING } from "../util/index.js";
import { State } from "./State.js";

/** State that stores an array and has additional methods to help with that. */
export class ArrayState<T> extends State<ImmutableArray<T>> implements Iterable<T> {
	// Set initial value to `[]`
	constructor(initial: Resolvable<ImmutableArray<T>> | typeof LOADING = []) {
		super(initial);
	}

	/** Count the number of entries in this map-like object. */
	get count(): number {
		return countItems(this.value);
	}

	/** Add an item to this array. */
	add(item: T): void {
		this.next(withItem(this.value, item));
	}

	/** Remove an item from this array. */
	remove(item: T): void {
		this.next(withoutItem(this.value, item));
	}

	/** Swap an item in this array with a different item. */
	swap(oldItem: T, newItem: T): void {
		this.next(swapItem(this.value, oldItem, newItem));
	}

	/** Toggle an item in this array. */
	toggle(item: T): void {
		this.next(toggleItem(this.value, item));
	}

	// Implement Iterable.
	*[Symbol.iterator](): Generator<T, void, undefined> {
		yield* this.value;
	}
}