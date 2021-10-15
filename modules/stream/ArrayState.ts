import { ImmutableArray, LOADING, Observable, Resolvable, swapItem, toggleItem, withItem, withoutItem, countItems } from "../util/index.js";
import { State } from "./State.js";

/** State that stores an array. */
export class ArrayState<T> extends State<ImmutableArray<T>> implements Iterable<T> {
	/** Create a new ArrayState. */
	static override create<X>(initial: ArrayState<X> | Observable<ImmutableArray<X>> | Resolvable<ImmutableArray<X>> | typeof LOADING = []): ArrayState<X> {
		return new ArrayState<X>(initial);
	}

	/** Count the number of entries in this map-like object. */
	get count(): number {
		return countItems(this.value);
	}

	/** Count the number of results of this set of documents (asynchronously). */
	get asyncCount(): number | Promise<number> {
		return this.loading ? this.nextValue.then(countItems) : countItems(this.value);
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
