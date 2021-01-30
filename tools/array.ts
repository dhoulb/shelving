import type { ReadonlyObject } from "./object";
import { SKIP } from "./";

/**
 * Mutable array: an array whose items can be written.
 * - Consistency with `MutableObject<T>` and `ReadonlyArray<T>`
 */
export type MutableArray<T = unknown> = T[];

/**
 * Readonly array: an array whose items are readonly.
 * - Consistency with `ReadonlyObject<T>` and `MutableArray<T>`
 */
export type ReadonlyArray<T = unknown> = readonly T[];

/**
 * Resolvable array: an object whose properties can be resolved with `resolveArray()`
 * - Items can be `SKIP` symbol (and they will be removed).
 * - Items can be `Promise` instances (and they will be awaited).
 */
export type ResolvableArray<T> = (typeof SKIP | T | Promise<typeof SKIP | T>)[];

/**
 * Dependencies: a readonly unknown array that is being used as a set of dependencies.
 */
export type Dependencies = readonly unknown[];

/**
 * Array type: extract the type for the items of an array or readonly array.
 * - Consistency with builtin `ReturnType<T>` and `ObjectType<T>`
 */
export type ArrayType<T extends ReadonlyArray> = T extends ReadonlyArray<infer X> ? X : never;

/** Is a value an array? */
export const isArray = <T extends unknown[]>(v: T | unknown): v is T => v instanceof Array;

/**
 * Break an array into equal sized chunks (last chunk might be smaller).
 *
 * @return New array with one or more sub-arrays for each chunk.
 * - The last chunk might not contain a full set of items.
 */
export const arrayChunk = <T extends unknown>(arr: T[], size: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
	return chunks;
};

/**
 * Add an item to an array.
 * - Returns an array that definitely contains the specified item.
 *
 * @return New array with the specified item.
 * - If the item already exists in the array (using `indexOf()`) then the item won't be added again and the exact same input array will be returned.
 */
export const withItem = <T>(arr: ReadonlyArray<T>, item: T): ReadonlyArray<T> => {
	const i = arr.indexOf(item);
	return i >= 0 ? arr : [...arr, item];
};

/**
 * Remove an item from an array.
 * - Finds all instances of the item from the array and returns an array that definitely does not contain it.
 *
 * @return New array without the specified item.
 * - If the item does not already exist in the array (using `indexOf()`) then the exact same input array will be returned.
 */
export const withoutItem = <T>(arr: ReadonlyArray<T>, item: T): ReadonlyArray<T> => {
	let i = arr.indexOf(item);
	if (i < 0) return arr;
	const output = arr.slice();
	while (i >= 0) {
		output.splice(i, 1);
		i = output.indexOf(item, i);
	}
	return output;
};

/**
 * Toggle an item in and out of an array.
 *
 * @return New array with or without the specified item.
 */
export const toggleItem = <T>(arr: ReadonlyArray<T>, item: T): ReadonlyArray<T> => {
	const i = arr.indexOf(item);
	return i >= 0 ? withoutItem(arr, item) : [...arr, item];
};

/**
 * Replace all instances of an item from an array.
 *
 * @return New array with or without the specified item.
 * - If the item does not already exist in the array (using `indexOf()`) then the exact same input array will be returned.
 */
export const replaceItem = <T>(arr: ReadonlyArray<T>, oldItem: T, newItem: T): ReadonlyArray<T> => {
	let i = arr.indexOf(oldItem);
	if (i < 0) return arr;
	const output = arr.slice();
	while (i >= 0) {
		output[i] = newItem;
		i = output.indexOf(newItem, i + 1);
	}
	return output;
};

/** Get the first item from an array. */
export const getFirstItem = <T>(arr: ReadonlyArray<T>): T | undefined => arr[0];

/** Get the last entry from an object or array. */
export const getLastItem = <T>(arr: ReadonlyArray<T>): T | undefined => arr[arr.length - 1];

/**
 * Get the next array item in a list.
 * @return The item after the specified one, or `undefined` if the specified item does not exist in the array.
 */
export const getNextItem = <T>(arr: ReadonlyArray<T>, value: T): T | undefined => {
	const i = arr.indexOf(value);
	if (i >= 0) return arr[i + 1];
	return undefined;
};

/**
 * Get the previous array item in a list.
 * @return The item before the specified one, or `undefined` if the specified item does not exist in the array.
 */
export const getPrevItem = <T>(arr: ReadonlyArray<T>, value: T): T | undefined => {
	const i = arr.indexOf(value);
	if (i >= 1) return arr[i - 1];
	return undefined;
};

/**
 * Return a shuffled version of an array.
 * - Uses Fisher Yates algorithm.
 *
 * @returns Copy of the input array in a random order.
 */
export const shuffle = <T>(arr: ReadonlyArray<T>): ReadonlyArray<T> => {
	const shuffled = arr.slice();
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]] as [T, T];
	}
	return shuffled;
};

/**
 * Map the items in an array.
 *
 * @param arr The input array or object to map (if an object, `Object.entries()` will be performed automatically and the second argument to `mapper()` will be the string key).
 *
 * @param mapper Mapping function that receives the value and key and returns the corresponding value.
 * - Mapper can return a `Promise`. If it does will return a Promise that resolves once every value has resolved.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Mapper can be a non-function static value and all the values will be set to that value.
 *
 * @returns The mapped array.
 * - Immutable so if the values don't change then the same instance will be returned.
 */
export function mapArray<T extends ReadonlyArray<unknown>>(
	arr: T, //
	mapper: (value: ArrayType<T>, key: number) => ArrayType<T>,
): T;
export function mapArray<T extends ReadonlyArray<unknown>>(
	arr: T, //
	mapper: (value: ArrayType<T>, key: number) => ArrayType<T> | Promise<ArrayType<T>>,
): Promise<T>;
export function mapArray<I extends unknown, O extends unknown>(
	arr: ReadonlyArray<I>, //
	mapper: (value: I, key: number) => Promise<typeof SKIP | O>,
): Promise<ReadonlyArray<O>>;
export function mapArray<I extends unknown, O extends unknown>(
	arr: ReadonlyArray<I>, //
	mapper: ((value: I, key: number) => typeof SKIP | O) | O,
): ReadonlyArray<O>;
export function mapArray<I extends unknown, O extends unknown>(
	arr: ReadonlyObject<I>,
	mapper: (value: I, key: string) => Promise<typeof SKIP | O>,
): Promise<ReadonlyArray<O>>;
export function mapArray<I extends unknown, O extends unknown>(
	arr: ReadonlyObject<I>,
	mapper: ((value: I, key: string) => typeof SKIP | O) | O,
): ReadonlyArray<O>;
export function mapArray<I extends unknown, O extends unknown>(
	arr: ReadonlyArray<I> | ReadonlyObject<I>,
	mapper: ((value: I, key: number | string) => typeof SKIP | O | Promise<typeof SKIP | O>) | O,
): ReadonlyArray<O> | Promise<ReadonlyArray<O>> {
	let promises = false;
	let changed = !(arr instanceof Array);
	const output: ResolvableArray<O> = [];
	for (const [key, current] of Object.entries(arr)) {
		const next = mapper instanceof Function ? mapper(current, key) : mapper;
		if (next instanceof Promise) promises = true;
		if (next !== SKIP) output.push(next);
		if (next !== current) changed = true;
	}
	return promises ? resolveArray(output) : changed ? (output as O[]) : (arr as O[]);
}

/**
 * Resolve the items in an array.
 *
 * @param arr The input array.
 * - Any values that are `Promise` instances will be awaited.
 * - Any values that are the `SKIP` symbol will not be included in the output array.
 *
 * @returns Array containing resolved items.
 */
export const resolveArray = async <V>(arr: Readonly<ResolvableArray<V>>): Promise<Array<V>> => {
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
 * Adds an item to an array by reference.
 * - If the item already exists in the array (using `indexOf()`) then it won't be added again.
 */
export const addItem = <T>(arr: Array<T>, item: T): void => {
	if (arr.indexOf(item) < 0) arr.push(item);
};

/**
 * Delete an item from an array by reference.
 * - Deletes all instances of an item from an array by reference, and returns void.
 */
export const deleteItem = <T>(arr: Array<T>, value: T): void => {
	let i = arr.indexOf(value);
	if (i < 0) return;
	while (i >= 0) {
		arr.splice(i, 1);
		i = arr.indexOf(value, i);
	}
};
