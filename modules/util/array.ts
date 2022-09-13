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

/** Get the type of the _items_ in an array. */
export type ArrayItem<T extends ImmutableArray> = T[number];

/** Is an unknown value an array? */
export const isArray = <T extends ImmutableArray>(v: T | unknown): v is T => Array.isArray(v);

/** Assert that a value is an array. */
export function assertArray<T>(arr: ImmutableArray<T> | unknown): asserts arr is ImmutableArray<T> {
	if (!isArray(arr)) throw new AssertionError(`Must be array`, arr);
}

/** Is an unknown value an item in a specified array? */
export const isArrayItem = <T>(arr: ImmutableArray<T>, item: T | unknown): item is T => arr.includes(item as T);
export const isItem = isArrayItem;

/** Things that can be converted to arrays. */
export type PossibleArray<T> = ImmutableArray<T> | Iterable<T>;

/** Convert an iterable to an array (if its not already an array). */
export function getArray<T>(items: PossibleArray<T>): ImmutableArray<T> {
	return isArray(items) ? items : Array.from(items);
}

/** Add multiple items to an array (immutably) and return a new array with those items (or the same array if no changes were made). */
export function withArrayItems<T>(input: ImmutableArray<T>, ...items: T[]): ImmutableArray<T> {
	const extras = items.filter(_doesNotInclude, input);
	return extras.length ? [...input, ...extras] : input;
}

/** Remove multiple items from an array (immutably) and return a new array without those items (or the same array if no changes were made). */
export function withoutArrayItems<T>(input: ImmutableArray<T>, ...items: T[]): ImmutableArray<T> {
	const output = input.filter(_doesNotInclude, items);
	return output.length === input.length ? input : output;
}
function _doesNotInclude<T>(this: T[], value: T) {
	return !this.includes(value);
}

/** Toggle an item in and out of an array (immutably) and return a new array with or without the specified items (or the same array if no changes were made). */
export function toggleArrayItems<T>(input: ImmutableArray<T>, ...items: T[]): ImmutableArray<T> {
	const extras = items.filter(_doesNotInclude, input);
	const output = input.filter(_doesNotInclude, items);
	return extras.length ? [...output, ...extras] : output.length !== input.length ? output : input;
}

/** Get the first item from an array or iterable, or `null` if it didn't exist. */
export function getOptionalFirstItem<T>(items: PossibleArray<T>): T | null {
	const arr = getArray(items);
	return 0 in arr ? (arr[0] as T) : null;
}

/** Get the first item from an array or iterable. */
export function getFirstItem<T>(items: PossibleArray<T>): T {
	const item = getOptionalFirstItem(items);
	if (item === null) throw new RequiredError("First item is required");
	return item;
}

/** Get the last item from an array or iterable, or `null` if it didn't exist. */
export function getOptionalLastItem<T>(items: PossibleArray<T>): T | null {
	const arr = getArray(items);
	const j = arr.length - 1;
	return j in arr ? (arr[j] as T) : null;
}

/** Get the last item from an array or iterable. */
export function getLastItem<T>(items: PossibleArray<T>): T {
	const item = getOptionalLastItem(items);
	if (item === null) throw new RequiredError("Last item is required");
	return item;
}

/** Get the next item in an array or iterable. */
export function getNextItem<T>(items: PossibleArray<T>, value: T): T | null {
	const arr = getArray(items);
	const i = arr.indexOf(value);
	if (i >= 0) {
		const j = i + 1;
		if (j in arr) return arr[j] as T;
	}
	return null;
}

/** Get the previous item in an array or iterable. */
export function getPrevItem<T>(items: PossibleArray<T>, value: T): T | null {
	const arr = getArray(items);
	const i = arr.indexOf(value);
	if (i >= 1) {
		const j = i - 1;
		if (j in arr) return arr[j] as T;
	}
	return null;
}

/** Return a shuffled version of an array or iterable. */
export function shuffleArray<T>(input: PossibleArray<T>): ImmutableArray<T> {
	const output = Array.from(input);
	for (let i = output.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[output[i], output[j]] = [output[j]!, output[i]!]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}
	return output;
}

/** Add an item to an array (by reference) and return the set item. */
export function addArrayItem<T>(arr: MutableArray<T>, item: T): T {
	if (arr.indexOf(item) < 0) arr.push(item);
	return item;
}

/** Add multiple items to an array (by reference). */
export function addArrayItems<T>(arr: MutableArray<T>, ...items: T[]): void {
	for (const item of items) if (arr.indexOf(item) < 0) arr.push(item);
}

/** Remove multiple items from an array (by reference). */
export function removeArrayItems<T>(arr: MutableArray<T>, ...items: T[]): void {
	for (let i = arr.length - 1; i >= 0; i--) if (i in arr && items.includes(arr[i] as T)) arr.splice(i, 1);
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
export function isArrayMin<T>(arr: ImmutableArray<T>, min?: 1): arr is [T, ...T[]];
export function isArrayMin<T>(arr: ImmutableArray<T>, min: 2): arr is [T, T, ...T[]];
export function isArrayMin<T>(arr: ImmutableArray<T>, min: 3): arr is [T, T, T, ...T[]];
export function isArrayMin<T>(arr: ImmutableArray<T>, min: 4): arr is [T, T, T, T, ...T[]];
export function isArrayMin<T>(arr: ImmutableArray<T>, min: number): boolean;
export function isArrayMin<T>(arr: ImmutableArray<T>, min = 1): boolean {
	return arr.length >= min;
}

/** Assert that a value has a specific length (or length is in a specific range). */
export function assertArrayMin<T>(arr: ImmutableArray<T> | unknown, min?: 1): asserts arr is [T, ...T[]];
export function assertArrayMin<T>(arr: ImmutableArray<T> | unknown, min: 2): asserts arr is [T, T, ...T[]];
export function assertArrayMin<T>(arr: ImmutableArray<T> | unknown, min: 3): asserts arr is [T, T, T, ...T[]];
export function assertArrayMin<T>(arr: ImmutableArray<T> | unknown, min: 4): asserts arr is [T, T, T, T, ...T[]];
export function assertArrayMin<T>(arr: ImmutableArray<T> | unknown, min: number): asserts arr is ImmutableArray<T>;
export function assertArrayMin<T>(arr: ImmutableArray<T> | unknown, min = 1): asserts arr is ImmutableArray<T> {
	if (!isArray<ImmutableArray<T>>(arr) || !isArrayMin<T>(arr, min)) throw new AssertionError(`Must be array with minimum length ${min}`, arr);
}

/** Get an array if it has the specified minimum length.  */
export function getArrayMin<T>(arr: ImmutableArray<T>, min?: 1): [T, ...T[]];
export function getArrayMin<T>(arr: ImmutableArray<T>, min: 2): [T, T, ...T[]];
export function getArrayMin<T>(arr: ImmutableArray<T>, min: 3): [T, T, T, ...T[]];
export function getArrayMin<T>(arr: ImmutableArray<T>, min: 4): [T, T, T, T, ...T[]];
export function getArrayMin<T>(arr: ImmutableArray<T>, min: number): ImmutableArray<T>;
export function getArrayMin<T>(arr: ImmutableArray<T>, min = 1): ImmutableArray<T> {
	assertArrayMin(arr, min);
	return arr;
}
