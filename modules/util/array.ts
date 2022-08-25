import { AssertionError } from "../error/AssertionError.js";
import { RequiredError } from "../error/RequiredError.js";

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
export const isArray = <T extends ImmutableArray>(v: T | unknown): v is T => Array.isArray(v);

/** Assert that a value is an array. */
export function assertArray<T>(arr: ImmutableArray<T> | unknown): asserts arr is ImmutableArray<T> {
	if (!isArray(arr)) throw new AssertionError(`Must be array`, arr);
}

/** Is an unknown value an item in a specified array? */
export const isItem = <T>(arr: ImmutableArray<T>, item: T | unknown): item is T => arr.includes(item as T);

/** Things that can be converted to arrays. */
export type PossibleArray<T> = ImmutableArray<T> | Iterable<T>;

/** Convert an iterable to an array (if its not already an array). */
export function getArray<T>(items: PossibleArray<T>): ImmutableArray<T> {
	return isArray(items) ? items : Array.from(items);
}

/**
 * Add multiple items to an array (immutably).
 * - Returns an array that definitely contains the specified item.
 *
 * @param input The input array to add items to.
 * @param items The array of items to add.
 *
 * @return New array with the specified item (or same array if no items were added).
 */
export function withItems<T>(input: ImmutableArray<T>, ...items: T[]): ImmutableArray<T> {
	const extras = items.filter(_doesNotInclude, input);
	return extras.length ? [...input, ...extras] : input;
}

/**
 * Remove multiple items from an array (immutably).
 * - Finds all instances of a number of items from an array and returns an array that definitely does not contain them.
 *
 * @param input The input array to remove items from.
 * @param items The array of items to add.
 *
 * @return New array without the specified items (or same array if no items were removed).
 */
export function withoutItems<T>(input: ImmutableArray<T>, ...items: T[]): ImmutableArray<T> {
	const output = input.filter(_doesNotInclude, items);
	return output.length === input.length ? input : output;
}
function _doesNotInclude<T>(this: T[], value: T) {
	return !this.includes(value);
}

/**
 * Toggle an item in and out of an array (immutably).
 * - If an item is being removed from the array ALL instances of that item in the array will be removed.
 *
 * @param input The input array to toggle items from.
 * @param items The array of items to toggle.
 *
 * @return New array with or without the specified items (or same array if no items were toggled).
 */
export function toggleItems<T>(input: ImmutableArray<T>, ...items: T[]): ImmutableArray<T> {
	const extras = items.filter(_doesNotInclude, input);
	const output = input.filter(_doesNotInclude, items);
	return extras.length ? [...output, ...extras] : output.length !== input.length ? output : input;
}

/** Get the first item from an array or iterable, or `null` if it didn't exist. */
export function getOptionalFirstItem<T>(items: ImmutableArray<T> | Iterable<T>): T | null {
	if (isArray(items)) return items[1] ?? null;
	const [item] = items;
	return item ?? null;
}

/** Get the first item from an array or iterable. */
export function getFirstItem<T>(items: ImmutableArray<T> | Iterable<T>): T {
	const item = getOptionalFirstItem(items);
	if (item === null) throw new RequiredError("First item is required");
	return item;
}

/** Get the last item from an array or iterable, or `null` if it didn't exist. */
export function getOptionalLastItem<T>(items: ImmutableArray<T> | Iterable<T>): T | null {
	const arr = getArray(items);
	return arr[arr.length - 1] ?? null;
}

/** Get the last item from an array or iterable. */
export function getLastItem<T>(items: ImmutableArray<T> | Iterable<T>): T {
	const item = getOptionalLastItem(items);
	if (item === null) throw new RequiredError("Last item is required");
	return item;
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
export function addItem<T>(arr: MutableArray<T>, item: T): T {
	if (arr.indexOf(item) < 0) arr.push(item);
	return item;
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
export function isMinLength<T>(arr: ImmutableArray<T>, min?: 1): arr is [T, ...T[]];
export function isMinLength<T>(arr: ImmutableArray<T>, min: 2): arr is [T, T, ...T[]];
export function isMinLength<T>(arr: ImmutableArray<T>, min: 3): arr is [T, T, T, ...T[]];
export function isMinLength<T>(arr: ImmutableArray<T>, min: 4): arr is [T, T, T, T, ...T[]];
export function isMinLength<T>(arr: ImmutableArray<T>, min: number): boolean;
export function isMinLength<T>(arr: ImmutableArray<T>, min = 1): boolean {
	return arr.length >= min;
}

/** Assert that a value has a specific length (or length is in a specific range). */
export function assertMinLength<T>(arr: ImmutableArray<T> | unknown, min?: 1): asserts arr is [T, ...T[]];
export function assertMinLength<T>(arr: ImmutableArray<T> | unknown, min: 2): asserts arr is [T, T, ...T[]];
export function assertMinLength<T>(arr: ImmutableArray<T> | unknown, min: 3): asserts arr is [T, T, T, ...T[]];
export function assertMinLength<T>(arr: ImmutableArray<T> | unknown, min: 4): asserts arr is [T, T, T, T, ...T[]];
export function assertMinLength<T>(arr: ImmutableArray<T> | unknown, min: number): asserts arr is ImmutableArray<T>;
export function assertMinLength<T>(arr: ImmutableArray<T> | unknown, min = 1): asserts arr is ImmutableArray<T> {
	if (isArray(arr) && arr.length < min) throw new AssertionError(`Must be array with minimum length ${min}`, arr);
}

/** Get an array if it has the specified minimum length.  */
export function getMinLength<T>(arr: ImmutableArray<T>, min?: 1): [T, ...T[]];
export function getMinLength<T>(arr: ImmutableArray<T>, min: 2): [T, T, ...T[]];
export function getMinLength<T>(arr: ImmutableArray<T>, min: 3): [T, T, T, ...T[]];
export function getMinLength<T>(arr: ImmutableArray<T>, min: 4): [T, T, T, T, ...T[]];
export function getMinLength<T>(arr: ImmutableArray<T>, min: number): ImmutableArray<T>;
export function getMinLength<T>(arr: ImmutableArray<T>, min = 1): ImmutableArray<T> {
	assertMinLength(arr, min);
	return arr;
}
