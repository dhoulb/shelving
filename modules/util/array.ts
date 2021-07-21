import type { Resolvable } from "./data";
import { ImmutableObject, isIterable, Mutable } from "./object";
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
 * Break an array into equal sized chunks (last chunk might be smaller).
 *
 * @return New array with one or more sub-arrays for each chunk.
 * - The last chunk might not contain a full set of items.
 */
export const arrayChunk = <T>(arr: T[], size: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
	return chunks;
};

/** Sum an array of numbers and return the total. */
export const arraySum = (arr: ImmutableArray<number>): number => arr.reduce(arraySumReducer, 0);
const arraySumReducer = (a: number, b: number) => a + b;

/**
 * Add an item to an array.
 * - Returns an array that definitely contains the specified item.
 *
 * @return New array with the specified item.
 * - If the item already exists in the array (using `indexOf()`) then the item won't be added again and the exact same input array will be returned.
 */
export function withItem<T extends ImmutableArray>(arr: T, item: ArrayType<T>): T;
export function withItem<T>(arr: ImmutableArray<T>, item: T): ImmutableArray<T>;
export function withItem<T>(arr: ImmutableArray<T>, item: T): ImmutableArray<T> {
	const i = arr.indexOf(item);
	return i >= 0 ? arr : [...arr, item];
}

/**
 * Remove an item from an array.
 * - Finds all instances of the item from the array and returns an array that definitely does not contain it.
 *
 * @return New array without the specified item.
 * - If the item does not already exist in the array (using `indexOf()`) then the exact same input array will be returned.
 */
export function withoutItem<T extends ImmutableArray>(arr: T, item: ArrayType<T>): T;
export function withoutItem<T>(arr: ImmutableArray<T>, item: T): ImmutableArray<T>;
export function withoutItem<T>(arr: ImmutableArray<T>, item: T): ImmutableArray<T> {
	let i = arr.indexOf(item);
	if (i < 0) return arr;
	const output = arr.slice();
	while (i >= 0) {
		output.splice(i, 1);
		i = output.indexOf(item, i);
	}
	return output;
}

/**
 * Toggle an item in and out of an array.
 *
 * @return New array with or without the specified item.
 */
export function toggleItem<T extends ImmutableArray>(arr: T, item: ArrayType<T>): T;
export function toggleItem<T>(arr: ImmutableArray<T>, item: T): ImmutableArray<T>;
export function toggleItem<T>(arr: ImmutableArray<T>, item: T): ImmutableArray<T> {
	const i = arr.indexOf(item);
	return i >= 0 ? withoutItem(arr, item) : [...arr, item];
}

/**
 * Swap all instances of an item from an array.
 *
 * @return New array with or without the specified item.
 * - If the item does not already exist in the array (using `indexOf()`) then the exact same input array will be returned.
 */
export function swapItem<T extends ImmutableArray>(arr: T, oldItem: ArrayType<T>, newItem: ArrayType<T>): T;
export function swapItem<T>(arr: ImmutableArray<T>, oldItem: T, newItem: T): ImmutableArray<T>;
export function swapItem<T>(arr: ImmutableArray<T>, oldItem: T, newItem: T): ImmutableArray<T> {
	let i = arr.indexOf(oldItem);
	if (i < 0) return arr;
	const output = arr.slice();
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

/** Get the last entry from an object or array. */
export function getLastItem<T>(arr: [...unknown[], T]): T;
export function getLastItem<T>(arr: ImmutableArray<T>): T | undefined;
export function getLastItem<T>(arr: ImmutableArray<T>): T | undefined {
	return arr[arr.length - 1];
}

/**
 * Get the next array item in a list.
 * @return The item after the specified one, or `undefined` if the specified item does not exist in the array.
 */
export const getNextItem = <T>(arr: ImmutableArray<T>, value: T): T | undefined => {
	const i = arr.indexOf(value);
	if (i >= 0) return arr[i + 1];
	return undefined;
};

/**
 * Get the previous array item in a list.
 * @return The item before the specified one, or `undefined` if the specified item does not exist in the array.
 */
export const getPrevItem = <T>(arr: ImmutableArray<T>, value: T): T | undefined => {
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
 * @param arr|obj|iterable The input array or object to map (if an object, `Object.entries()` will be performed automatically and the second argument to `mapper()` will be the string key).
 *
 * @param mapper Mapping function that receives the value and key and returns the corresponding value.
 * - Mapper can return a promise. If it does will return a Promise that resolves once every value has resolved.
 * - Return the `SKIP` symbol from the mapper to skip that property and not include it in the output object.
 * - `SKIP` is useful because using `filter(Boolean)` doesn't currently filter in TypeScript (and requires another loop anyway).
 * - Mapper can be a non-function static value and all the values will be set to that value.
 *
 * @returns The mapped array.
 * - Immutable so if the values don't change then the same instance will be returned.
 */
export function mapItems<I extends unknown, O extends unknown>(
	arr: Iterable<I>, //
	mapper: (value: I) => Promise<typeof SKIP | O>,
): Promise<ImmutableArray<O>>;
export function mapItems<I extends unknown, O extends unknown>(
	arr: Iterable<I>, //
	mapper: ((value: I) => typeof SKIP | O) | O,
): ImmutableArray<O>;
export function mapItems<I extends unknown, O extends unknown>(
	obj: ImmutableObject<I>, //
	mapper: (value: I) => Promise<typeof SKIP | O>,
): Promise<ImmutableArray<O>>;
export function mapItems<I extends unknown, O extends unknown>(
	obj: ImmutableObject<I>, //
	mapper: ((value: I) => typeof SKIP | O) | O,
): ImmutableArray<O>;
export function mapItems(
	input: ImmutableArray | ImmutableObject | Iterable<unknown>,
	mapper: ((value: unknown, key: number | string) => Resolvable<unknown>) | Resolvable<unknown>,
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
 * @param arr The input array.
 * - Any values that are `Promise` instances will be awaited.
 * - Any values that are the `SKIP` symbol will not be included in the output array.
 *
 * @returns Array containing resolved items.
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
 * Add an item to an array by reference.
 * - If the item already exists in the array (using `indexOf()`) then it won't be added again.
 */
export function addItem<T extends MutableArray>(arr: T, item: ArrayType<T>): void;
export function addItem<T>(arr: MutableArray<T>, item: T): void;
export function addItem<T>(arr: MutableArray<T>, item: T): void {
	if (arr.indexOf(item) < 0) arr.push(item);
}

/**
 * Remove an item from an array by reference.
 * - Deletes all instances of an item from an array by reference, and returns void.
 */
export function removeItem<T extends MutableArray>(arr: T, value: ArrayType<T>): void;
export function removeItem<T>(arr: MutableArray<T>, value: T): void;
export function removeItem<T>(arr: MutableArray<T>, value: T): void {
	let i = arr.indexOf(value);
	if (i < 0) return;
	while (i >= 0) {
		arr.splice(i, 1);
		i = arr.indexOf(value, i);
	}
}

/**
 * Return an element where only unique items are kept.
 * - Removes duplicate instances of values from the array.
 * - Returns the same instance if no changes were made.
 */
export const uniqueItems = <T>(arr: ImmutableArray<T>): ImmutableArray<T> => {
	if (!arr.length) return arr;
	const unique = arr.filter(filterUnique);
	return unique.length === arr.length ? arr : unique;
};
const filterUnique = <T>(item: T, i: number, arr: ImmutableArray<T>) => i === arr.indexOf(item);
