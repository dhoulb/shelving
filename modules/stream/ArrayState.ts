import { ImmutableArray, swapItem, toggleItem, withItem, withoutItem } from "../util/array.js";
import { State } from "./State.js";

/** State that stores an array and has additional methods to help with that. */
export class ArrayState<T> extends State<ImmutableArray<T>> implements Iterable<T> {
	// Set default value to be empty array.
	override _value = [];

	/** Get the length of the current value of this state. */
	get length(): number {
		return this._value.length;
	}

	/** Add an item to this array. */
	add(item: T): void {
		this.next(withItem(this._value, item));
	}

	/** Remove an item from this array. */
	delete(item: T): void {
		this.next(withoutItem(this._value, item));
	}

	/** Swap an item in this array with a different item. */
	swap(oldItem: T, newItem: T): void {
		this.next(swapItem(this._value, oldItem, newItem));
	}

	/** Toggle an item in this array. */
	toggle(item: T): void {
		this.next(toggleItem(this._value, item));
	}

	/** Iterate over the items. */
	[Symbol.iterator](): Iterator<T, void> {
		return this._value.values();
	}
}
