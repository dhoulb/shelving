import type { ImmutableArray, PossibleArray } from "../util/array.js";
import {
	getFirst,
	getLast,
	omitArrayItems,
	requireArray,
	requireFirst,
	requireLast,
	toggleArrayItems,
	withArrayItems,
} from "../util/array.js";
import type { AnyCaller } from "../util/function.js";
import { BusyStore } from "./BusyStore.js";

/**
 * Store an immutable array of items, with helpers to read and mutate its contents.
 * - Accepts any `PossibleArray<T>` as input and normalises it to an `ImmutableArray<T>`.
 * - Mutations (`add()`, `delete()`, `toggle()`) replace the stored array with an immutable updated copy.
 * - Iterable, so you can `for (const item of store)`.
 *
 * @param value The initial array value (defaults to an empty array).
 * @example
 * const store = new ArrayStore([1, 2, 3]);
 * store.add(4); // [1, 2, 3, 4]
 * store.first; // 1
 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore
 */
export class ArrayStore<T> extends BusyStore<ImmutableArray<T>, PossibleArray<T>> implements Iterable<T> {
	// Override to set default value to `[]` and convert possible arrays.
	constructor(value: PossibleArray<T> = []) {
		super(requireArray(value, undefined, undefined, ArrayStore));
	}

	// Implement to convert possible arrays.
	protected override _convert(input: PossibleArray<T>, caller: AnyCaller): ImmutableArray<T> {
		return requireArray(input, undefined, undefined, caller);
	}

	/**
	 * Get the first item in this store, or `undefined` if it has no items.
	 *
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/optionalFirst
	 */
	get optionalFirst(): T | undefined {
		return getFirst(this.value);
	}

	/**
	 * Get the last item in this store, or `undefined` if it has no items.
	 *
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/optionalLast
	 */
	get optionalLast(): T | undefined {
		return getLast(this.value);
	}

	/**
	 * Get the first item in this store, or throw `RequiredError` if it has no items.
	 *
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/first
	 */
	get first(): T {
		return requireFirst(this.value);
	}

	/**
	 * Get the last item in this store, or throw `RequiredError` if it has no items.
	 *
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/last
	 */
	get last(): T {
		return requireLast(this.value);
	}

	/**
	 * Whether this store has at least one item.
	 *
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/exists
	 */
	get exists(): boolean {
		return !!this.value.length;
	}

	/**
	 * Get the number of items in the current value of this store.
	 *
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/count
	 */
	get count(): number {
		return this.value.length;
	}

	/**
	 * Add one or more items to this array.
	 * - Duplicate items (already present in the array) are skipped.
	 *
	 * @param items The items to add.
	 * @returns Nothing.
	 * @example store.add(4, 5);
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/add
	 */
	add(...items: T[]): void {
		this.value = withArrayItems(this.value, ...items);
	}

	/**
	 * Remove one or more items from this array.
	 *
	 * @param items The items to remove.
	 * @returns Nothing.
	 * @example store.delete(2, 3);
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/delete
	 */
	delete(...items: T[]): void {
		this.value = omitArrayItems(this.value, ...items);
	}

	/**
	 * Toggle one or more items in this array (add if absent, remove if present).
	 *
	 * @param items The items to toggle.
	 * @returns Nothing.
	 * @example store.toggle(1, 4);
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/toggle
	 */
	toggle(...items: T[]): void {
		this.value = toggleArrayItems(this.value, ...items);
	}

	/**
	 * Iterate over the items in this store's current array.
	 *
	 * @returns An iterator over the items.
	 * @see https://dhoulb.github.io/shelving/store/ArrayStore/ArrayStore/[Symbol.iterator]
	 */
	[Symbol.iterator](): Iterator<T, void> {
		return this.value.values();
	}
}
