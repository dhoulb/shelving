import type { Resolvable } from "./data";
import type { ImmutableObject, Mutable } from "./object";
import { SKIP } from "./constants";
import { isAsync } from "./promise";

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
 * Resolvable array: an object whose properties can be resolved with `resolveArray()`
 * - Items can be `SKIP` symbol (and they will be removed).
 * - Items can be `Promise` instances (and they will be awaited).
 */
export type ResolvableArray<T = unknown> = readonly Resolvable<T>[];

/**
 * Array type: extract the type for the items of an array or readonly array.
 * - Consistency with builtin `ReturnType<T>` and `ObjectType<T>`
 */
export type ArrayType<T extends ImmutableArray> = T[number];

/** Is an unknown value an array? */
export const isArray = <T extends ImmutableArray>(v: T | unknown): v is T => v instanceof Array;

/** Is an unknown value an item in a specified array? */
export const isItem = <T extends unknown>(arr: ImmutableArray<T>, item: T | unknown): item is T => arr.includes(item as T);

/**
 * Is a value an iterable object?
 * - Any object with a `Symbol.iterator` property is iterable.
 * - Note: Array and Map instances etc will return true because they implement `Symbol.iterator`
 */
export const isIterable = <T extends Iterable<unknown>>(value: T | unknown): value is T => typeof value === "object" && !!value && Symbol.iterator in value;

/**
 * Break an array into equal sized chunks (last chunk might be smaller).
 *
 * @param arr The target array to split into chunks.
 * @param size The number of items in each chunk.
 *
 * @return New array with one or more sub-arrays for each chunk.
 * - The last chunk might not contain a full set of items.
 */
export function arrayChunk<T>(arr: ImmutableArray<T>, size: number): ImmutableArray<ImmutableArray<T>> {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
	return chunks;
}

/** Sum an array of numbers and return the total. */
export const arraySum = (arr: ImmutableArray<number>): number => arr.reduce(arraySumReducer, 0);
const arraySumReducer = (a: number, b: number) => a + b;

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

/** Get the first item from an array. */
export function getFirstItem<T>(arr: [T, ...unknown[]]): T;
export function getFirstItem<T>(arr: ImmutableArray<T>): T | undefined;
export function getFirstItem<T>(arr: ImmutableArray<T>): T | undefined {
	return arr[0];
}

/** Get the second item from an array. */
export function getSecondItem<T>(arr: [unknown, T, ...unknown[]]): T;
export function getSecondItem<T>(arr: ImmutableArray<T>): T | undefined;
export function getSecondItem<T>(arr: ImmutableArray<T>): T | undefined {
	return arr[1];
}

/** Get the last item from an array. */
export function getLastItem<T>(arr: [...unknown[], T]): T;
export function getLastItem<T>(arr: ImmutableArray<T>): T | undefined;
export function getLastItem<T>(arr: ImmutableArray<T>): T | undefined {
	return arr[arr.length - 1];
}

/**
 * Get the next item in an array.
 *
 * @param arr The target array.
 * @param value The value of the target item.
 * @return The item after the target item, or `undefined` if that item does not exist in the array.
 */
export const getNextItem = <T>(arr: ImmutableArray<T>, value: T): T | undefined => {
	const i = arr.indexOf(value);
	if (i >= 0) return arr[i + 1];
	return undefined;
};

/**
 * Get the previous item in an array.
 *
 * @param arr The target array.
 * @param value The value of the target item.
 *
 * @return The item before the target item, or `undefined` if that item does not exist in the array.
 */
export const getPrevItem = <T>(arr: ImmutableArray<T>, value: T): T | undefined => {
	const i = arr.indexOf(value);
	if (i >= 1) return arr[i - 1];
	return undefined;
};

/**
 * Return a shuffled version of an array or iterable.
 * - Uses Fisher Yates algorithm.
 *
 * @param arr The target array to shuffle.
 * @return Copy of the input array in a random order.
 */
export const shuffle = <T>(arr: ImmutableArray<T>): ImmutableArray<T> => {
	const shuffled = arr.slice();
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
	}
	return shuffled;
};

/**
 * Map the items in an array.
 *
 * @param input The input array or map-like object to iterate over.
 * @param mapper Mapping function that receives the value and key and returns the corresponding value.
 * - Mapper can return a promise. If it does will return a Promise that resolves once every value has resolved.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Mapper can be a non-function static value and all the values will be set to that value.
 *
 * @return The mapped array.
 * - Immutable so if the values don't change then the same instance will be returned.
 */
export function mapItems<I extends unknown, O extends unknown>(
	input: Iterable<I> | ImmutableObject<I>, //
	mapper: (value: I) => Promise<typeof SKIP | O>,
): Promise<ImmutableArray<O>>;
export function mapItems<I extends unknown, O extends unknown>(
	input: Iterable<I> | ImmutableObject<I>, //
	mapper: ((value: I) => typeof SKIP | O) | O,
): ImmutableArray<O>;
export function mapItems(
	input: ImmutableObject | Iterable<unknown>,
	mapper: ((value: unknown) => Resolvable<unknown>) | Resolvable<unknown>,
): ImmutableArray | Promise<ImmutableArray> {
	let promises = false;
	let changed = false;
	const output: Mutable<ResolvableArray<unknown>> = [];
	const iterable = isIterable(input) ? input : Object.values(input);
	for (const current of iterable) {
		const next = typeof mapper === "function" ? mapper(current) : mapper;
		if (isAsync(next)) promises = true;
		if (next !== SKIP) output.push(next);
		if (next !== current) changed = true;
	}
	return promises ? resolveArray<unknown>(output) : !changed && isArray(input) ? input : output;
}

/**
 * Map an entire array.
 * - This is a copy of `mapItems()` but with different generics that allow you to specify the exact input and output types.
 * - It can't be an overload of `mapArray()` because the overloads are too similar and there's no way for TypeScript to distinguish between them.
 */
export const mapArray: <I extends ImmutableArray, O extends ImmutableArray>(
	input: I, //
	mapper: (value: I[keyof I], key: string) => O[keyof O],
) => O = mapItems;

/**
 * Resolve the items in an array.
 *
 * @param arr The input array to resolve.
 * - Any values that are `Promise` instances will be awaited.
 * - Any values that are the `SKIP` symbol will not be included in the output array.
 *
 * @return Array containing resolved items.
 */
export const resolveArray = async <V>(arr: ResolvableArray<V>): Promise<ImmutableArray<V>> => {
	const resolved: V[] = [];
	await Promise.all(
		arr.map(async current => {
			const next = await current;
			if (next !== SKIP) resolved.push(next);
		}),
	);
	return resolved;
};

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
export function removeItem<T>(arr: MutableArray<T>, value: T): void {
	let i = arr.indexOf(value);
	if (i < 0) return;
	while (i >= 0) {
		arr.splice(i, 1);
		i = arr.indexOf(value, i);
	}
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

/**
 * Return an array of the unique items in an array or iterable.
 *
 * @param input The array or iterable to make unique.
 *
 * @return New array where any duplicate items have been removed.
 * - Returns the same instance if no changes were made.
 */
export function uniqueItems<T>(input: Iterable<T>): ImmutableArray<T> {
	const output: MutableArray<T> = [];
	for (const item of input) if (output.indexOf(item) < 0) output.push(item);
	return output;
}

/**
 * Count the number of items in an array or iterable.
 *
 * @param items The input array or iterable to count.
 *
 * @return Number of items.
 */
export function countItems<T>(items: Iterable<T>): number {
	if (isArray(items)) return items.length;
	let count = 0;
	for (const unused of items) count++; // eslint-disable-line @typescript-eslint/no-unused-vars
	return count;
}
