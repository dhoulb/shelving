import { AssertionError } from "../error/index.js";

/**
 * Mutable array: an array that can be changed.
 * - Consistency with `MutableObject<T>` and `ImmutableArray<T>`
 */
export type MutableArray<T = unknown> = T[];

/**
 * Immutable array: an array that cannot be changed.
 * - Consistency with `ImmutableObject<T>` and `MutableArray<T>`
 */
export type ImmutableArray<T = unknown> = readonly T[];

/**
 * Array type: extract the type for the items of an array or readonly array.
 * - Consistency with builtin `ReturnType<T>` and `ObjectType<T>`
 */
export type ArrayType<T extends ImmutableArray> = T[number];

/** Is an unknown value an array? */
export const isArray = <T extends ImmutableArray>(v: T | unknown): v is T => v instanceof Array;

/** Is an unknown value an item in a specified array? */
export const isItem = <T>(arr: ImmutableArray<T>, item: T | unknown): item is T => arr.includes(item as T);

/** Convert an iterable to an array (if its not already an array). */
export function toArray<T>(items: MutableArray<T> | Iterable<T>): MutableArray<T>;
export function toArray<T>(items: ImmutableArray<T> | Iterable<T>): ImmutableArray<T>;
export function toArray<T>(items: ImmutableArray<T> | Iterable<T>): ImmutableArray<T> {
	return isArray(items) ? items : Array.from(items);
}

/**
 * Add an item to an array (immutably).
 * - Returns an array that definitely contains the specified item.
 *
 * @param input The input array to add items to.
 * @param item The item to add.
 *
 * @return New array with the specified item.
 * - If the item already exists in the array (using `indexOf()`) then the item won't be added again and the exact same input array will be returned.
 */
export function withItem<T>(input: ImmutableArray<T>, item: T): ImmutableArray<T> {
	const i = input.indexOf(item);
	return i >= 0 ? input : [...input, item];
}

/**
 * Add multiple items to an array (immutably).
 * - Returns an array that definitely contains the specified item.
 *
 * @param input The input array to add items to.
 * @param items The array of items to add.
 *
 * @return New array with the specified item.
 * - If all items already exist in the array (using `indexOf()`) then the items won't be added again and the exact same input array will be returned.
 */
export function withItems<T>(input: ImmutableArray<T>, items: Iterable<T>): ImmutableArray<T> {
	let output = input;
	for (const item of items) output = withItem(output, item);
	return output;
}

/**
 * Remove an item from an array (immutably).
 * - Finds all instances of the item from the array and returns an array that definitely does not contain it.
 *
 * @param input The input array to remove items from.
 * @param item The item to remove.
 *
 * @return New array without the specified item.
 * - If the item does not already exist in the array (using `indexOf()`) then the exact same input array will be returned.
 */
export function withoutItem<T>(input: ImmutableArray<T>, item: T): ImmutableArray<T> {
	let i = input.indexOf(item);
	if (i < 0) return input;
	const output = input.slice();
	while (i >= 0) {
		output.splice(i, 1);
		i = output.indexOf(item, i);
	}
	return output;
}

/**
 * Remove multiple items from an array (immutably).
 * - Finds all instances of a number of items from an array and returns an array that definitely does not contain them.
 *
 * @param input The input array to remove items from.
 * @param items The array of items to add.
 *
 * @return New array without the specified item.
 * - If the items do not already exist in the array (using `indexOf()`) then the exact same input array will be returned.
 */
export function withoutItems<T>(input: ImmutableArray<T>, items: Iterable<T>): ImmutableArray<T> {
	let output = input;
	for (const item of items) output = withoutItem(output, item);
	return output;
}

/**
 * Toggle an item in and out of an array (immutably).
 * - If the item is being removed from the array ALL instances of that item in the array will be removed.
 *
 * @param input The input array to toggle items from.
 * @param item The items to toggle.
 *
 * @return New array with or without the specified item.
 */
export function toggleItem<T>(input: ImmutableArray<T>, item: T): ImmutableArray<T> {
	const i = input.indexOf(item);
	return i >= 0 ? withoutItem(input, item) : [...input, item];
}

/**
 * Toggle an item in and out of an array (immutably).
 * - If an item is being removed from the array ALL instances of that item in the array will be removed.
 *
 * @param input The input array to toggle items from.
 * @param items The array of items to toggle.
 *
 * @return New array with or without the specified item.
 */
export function toggleItems<T>(input: ImmutableArray<T>, items: Iterable<T>): ImmutableArray<T> {
	let output = input;
	for (const item of items) output = toggleItem(output, item);
	return output;
}

/**
 * Swap an item in an array for a new item (immutably).
 * - All instances of the item in the array will be swapped for the new item.
 *
 * @param input The input array to swap items in.
 * @param oldItem The item to replace with `newItem`
 * @param newItem The item to replace `oldItem` with.
 *
 * @return New array with or without the specified item.
 * - If the item does not already exist in the array (using `indexOf()`) then the exact same input array will be returned.
 */
export function swapItem<T>(input: ImmutableArray<T>, oldItem: T, newItem: T): ImmutableArray<T> {
	let i = input.indexOf(oldItem);
	if (i < 0) return input;
	const output = input.slice();
	while (i >= 0) {
		output[i] = newItem;
		i = output.indexOf(newItem, i + 1);
	}
	return output;
}

/** Get the first item from an array or iterable. */
export function getFirstItem<T>(items: ImmutableArray<T> | Iterable<T>): T | undefined {
	if (items instanceof Array) return items[0];
	const [item] = items;
	return item;
}

/** Get the second item from an array or iterable. */
export function getSecondItem<T>(items: ImmutableArray<T> | Iterable<T>): T | undefined {
	if (items instanceof Array) return items[1];
	const [, item] = items;
	return item;
}

/** Get the last item from an array or iterable. */
export function getLastItem<T>(items: ImmutableArray<T> | Iterable<T>): T | undefined {
	if (items instanceof Array) return items[items.length];
	let value: T | undefined = undefined;
	for (value of items) {
		// unused
	}
	return value;
}

/**
 * Get the next item in an array.
 *
 * @param arr The target array.
 * @param value The value of the target item.
 * @return The item after the target item, or `undefined` if that item does not exist in the array.
 */
export function getNextItem<T>(arr: ImmutableArray<T>, value: T): T | undefined {
	const i = arr.indexOf(value);
	if (i >= 0) return arr[i + 1];
	return undefined;
}

/**
 * Get the previous item in an array.
 *
 * @param arr The target array.
 * @param value The value of the target item.
 *
 * @return The item before the target item, or `undefined` if that item does not exist in the array.
 */
export function getPrevItem<T>(arr: ImmutableArray<T>, value: T): T | undefined {
	const i = arr.indexOf(value);
	if (i >= 1) return arr[i - 1];
	return undefined;
}

/**
 * Return a shuffled version of an array or iterable.
 * - Uses Fisher Yates algorithm.
 *
 * @param input The input array or iterable to shuffle.
 * @return Copy of in a random order.
 */
export function shuffleArray<T>(input: Iterable<T>): ImmutableArray<T> {
	const output = Array.from(input);
	for (let i = output.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[output[i], output[j]] = [output[j]!, output[i]!]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}
	return output;
}

/**
 * Add an item to an array (by reference).
 * - If the item already exists in the array (using `indexOf()`) then it won't be added again.
 *
 * @param arr The target array to add items to.
 * @param item The item to add.
 */
export function addItem<T>(arr: MutableArray<T>, item: T): void {
	if (arr.indexOf(item) < 0) arr.push(item);
}

/**
 * Add multiple items to an array (by reference).
 * - If an item already exists in the array (using `indexOf()`) then it won't be added again.
 *
 * @param arr The target array to add items to.
 * @param items The array of items to add.
 */
export function addItems<T>(arr: MutableArray<T>, items: Iterable<T>): void {
	for (const item of items) addItem(arr, item);
}

/**
 * Remove an item from an array (by reference).
 * - Deletes all instances of an item from an array by reference, and returns void.
 *
 * @param arr The target array to remove items from.
 * @param item The item to remove.
 */
export function removeItem<T>(arr: MutableArray<T>, item: T): void {
	for (let i = arr.indexOf(item); i >= 0; i = arr.indexOf(item, i)) arr.splice(i, 1);
}

/**
 * Remove multiple items from an array (by reference).
 * - Deletes all instances of an item from an array by reference, and returns void.
 *
 * @param arr The target array to remove items from.
 * @param items The array of items to remove.
 */
export function removeItems<T>(arr: MutableArray<T>, items: Iterable<T>): void {
	for (const item of items) removeItem(arr, item);
}

/** Return an array of the unique items in an array. */
export function uniqueArray<T>(input: Iterable<T>): ImmutableArray<T> {
	const output: MutableArray<T> = [];
	for (const item of input) if (!output.includes(item)) output.push(item);
	return output;
}

/** Apply a limit to an array. */
export function limitArray<T>(arr: ImmutableArray<T>, limit: number): ImmutableArray<T> {
	return limit > arr.length ? arr : arr.slice(0, limit);
}

/** Does an array have the specified minimum length.  */
export function isMinimumLength<T>(arr: ImmutableArray<T>, min?: 1): arr is [T, ...T[]];
export function isMinimumLength<T>(arr: ImmutableArray<T>, min: 2): arr is [T, T, ...T[]];
export function isMinimumLength<T>(arr: ImmutableArray<T>, min: 3): arr is [T, T, T, ...T[]];
export function isMinimumLength<T>(arr: ImmutableArray<T>, min: 4): arr is [T, T, T, T, ...T[]];
export function isMinimumLength<T>(arr: ImmutableArray<T>, min: number): arr is [T, T, T, T, T, ...T[]];
export function isMinimumLength<T>(arr: ImmutableArray<T>, min = 1): boolean {
	return arr.length >= min;
}

/** Get an array if it has the specified minimum length.  */
export function getMinimumLength<T>(arr: ImmutableArray<T>, min?: 1): [T, ...T[]];
export function getMinimumLength<T>(arr: ImmutableArray<T>, min: 2): [T, T, ...T[]];
export function getMinimumLength<T>(arr: ImmutableArray<T>, min: 3): [T, T, T, ...T[]];
export function getMinimumLength<T>(arr: ImmutableArray<T>, min: 4): [T, T, T, T, ...T[]];
export function getMinimumLength<T>(arr: ImmutableArray<T>, min: number): [T, T, T, T, T, ...T[]];
export function getMinimumLength<T>(arr: ImmutableArray<T>, min = 1): ImmutableArray<T> {
	if (arr.length >= min) return arr;
	throw new AssertionError(`Must have minimum length ${min}`, arr);
}
