import { AssertionError } from "../error/AssertionError.js";
import { RequiredError } from "../error/RequiredError.js";
import { omitItems, pickItems } from "./iterate.js";
import { formatRange } from "./number.js";

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

/** Things that can be converted to arrays. */
export type PossibleArray<T> = ImmutableArray<T> | Iterable<T>;

/** Is an unknown value an array? */
export const isArray = <T extends ImmutableArray>(value: T | unknown): value is T => Array.isArray(value);

/** Assert that an unknown value is an array. */
export function assertArray<T>(arr: ImmutableArray<T> | unknown): asserts arr is ImmutableArray<T> {
	if (!isArray(arr)) throw new AssertionError(`Must be array`, arr);
}

/** Is an unknown value an item in a specified array? */
export const isArrayItem = <T>(arr: ImmutableArray<T>, item: T | unknown): item is T => arr.includes(item as T);

/** Assert that an unknown value is an item in a specified array. */
export function assertArrayItem<T>(arr: ImmutableArray<T>, item: T | unknown): asserts item is T {
	if (!isArrayItem(arr, item)) throw new AssertionError(`Must be array item`, item);
}

/** Convert an iterable to an array (if its not already an array). */
export function getArray<T>(items: PossibleArray<T>): ImmutableArray<T> {
	return isArray(items) ? items : Array.from(items);
}

/** Add multiple items to an array (immutably) and return a new array with those items (or the same array if no changes were made). */
export function withArrayItems<T>(arr: ImmutableArray<T>, ...items: T[]): ImmutableArray<T> {
	const extras = items.filter(_doesNotInclude, arr);
	return extras.length ? [...arr, ...extras] : arr;
}
function _doesNotInclude<T>(this: T[], value: T) {
	return !this.includes(value);
}

/** Pick multiple items from an array (immutably) and return a new array without those items (or the same array if no changes were made). */
export function pickArrayItems<T>(input: ImmutableArray<T> | Iterable<T>, ...pick: T[]): ImmutableArray<T> {
	const output = Array.from(pickItems(input, ...pick));
	return isArray(input) && output.length === input.length ? input : output;
}

/** Remove multiple items from an array (immutably) and return a new array without those items (or the same array if no changes were made). */
export function omitArrayItems<T>(input: ImmutableArray<T> | Iterable<T>, ...omit: T[]): ImmutableArray<T> {
	const output = Array.from(omitItems(input, ...omit));
	return isArray(input) && output.length === input.length ? input : output;
}

/** Clear an array (immutably) and return a new empty array (or the same array if no changes were made). */
export const clearArray = <T>(input: ImmutableArray<T>): ImmutableArray<T> => (input.length ? [] : input);

/** Toggle an item in and out of an array (immutably) and return a new array with or without the specified items (or the same array if no changes were made). */
export function toggleArrayItems<T>(input: ImmutableArray<T>, ...items: T[]): ImmutableArray<T> {
	const extras = items.filter(_doesNotInclude, input);
	const output = input.filter(_doesNotInclude, items);
	return extras.length ? [...output, ...extras] : output.length !== input.length ? output : input;
}

/** Get the first item from an array or iterable, or `undefined` if it didn't exist. */
export function getOptionalFirstItem<T>(items: PossibleArray<T>): T | undefined {
	const arr = getArray(items);
	return 0 in arr ? arr[0] : undefined;
}

/** Get the first item from an array or iterable. */
export function getFirstItem<T>(items: PossibleArray<T>): T {
	const item = getOptionalFirstItem(items);
	if (item === undefined) throw new RequiredError("First item is required");
	return item;
}

/** Get the last item from an array or iterable, or `undefined` if it didn't exist. */
export function getOptionalLastItem<T>(items: PossibleArray<T>): T | undefined {
	const arr = getArray(items);
	const j = arr.length - 1;
	if (j in arr) return arr[j] as T;
}

/** Get the last item from an array or iterable. */
export function getLastItem<T>(items: PossibleArray<T>): T {
	const item = getOptionalLastItem(items);
	if (item === undefined) throw new RequiredError("Last item is required");
	return item;
}

/** Get the next item in an array or iterable. */
export function getOptionalNextItem<T>(items: PossibleArray<T>, value: T): T | undefined {
	const arr = getArray(items);
	const i = arr.indexOf(value);
	if (i >= 0) {
		const j = i + 1;
		if (j in arr) return arr[j] as T;
	}
}

/** Get the previous item in an array or iterable. */
export function getOptionalPrevItem<T>(items: PossibleArray<T>, value: T): T | undefined {
	const arr = getArray(items);
	const i = arr.indexOf(value);
	if (i >= 1) {
		const j = i - 1;
		if (j in arr) return arr[j] as T;
	}
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
export function deleteArrayItems<T>(arr: MutableArray<T>, ...items: T[]): void {
	for (let i = arr.length - 1; i >= 0; i--) if (i in arr && items.includes(arr[i] as T)) arr.splice(i, 1);
}

/** Return an array of the unique items in an array. */
export function getUniqueArray<T>(input: ImmutableArray<T> | Iterable<T>): ImmutableArray<T> {
	const output: MutableArray<T> = [];
	for (const item of input) if (!output.includes(item)) output.push(item);
	return isArray(input) && input.length === output.length ? input : output;
}

/** Apply a limit to an array. */
export function limitArray<T>(items: Iterable<T>, limit: number): ImmutableArray<T> {
	const arr = getArray(items);
	return limit > arr.length ? arr : arr.slice(0, limit);
}

/** Count the items in an array. */
export function countArray<T>(arr: ImmutableArray<T>): number {
	return arr.length;
}

/** Does an array have the specified minimum length.  */
export function isArrayLength<T>(arr: MutableArray<T>, min: 1, max: 1): arr is [T];
export function isArrayLength<T>(arr: MutableArray<T>, min: 2, max: 2): arr is [T, T];
export function isArrayLength<T>(arr: MutableArray<T>, min: 3, max: 3): arr is [T, T, T];
export function isArrayLength<T>(arr: MutableArray<T>, min: 4, max: 4): arr is [T, T, T, T];
export function isArrayLength<T>(arr: MutableArray<T>, min?: 1, max?: number): arr is [T, ...T[]];
export function isArrayLength<T>(arr: MutableArray<T>, min: 2, max?: number): arr is [T, T, ...T[]];
export function isArrayLength<T>(arr: MutableArray<T>, min: 3, max?: number): arr is [T, T, T, ...T[]];
export function isArrayLength<T>(arr: MutableArray<T>, min: 4, max?: number): arr is [T, T, T, T, ...T[]];
export function isArrayLength<T>(arr: MutableArray<T>, min?: number, max?: number): arr is MutableArray<T>;
export function isArrayLength<T>(arr: ImmutableArray<T>, min: 1, max: 1): arr is readonly [T];
export function isArrayLength<T>(arr: ImmutableArray<T>, min: 2, max: 2): arr is readonly [T, T];
export function isArrayLength<T>(arr: ImmutableArray<T>, min: 3, max: 3): arr is readonly [T, T, T];
export function isArrayLength<T>(arr: ImmutableArray<T>, min: 4, max: 4): arr is readonly [T, T, T, T];
export function isArrayLength<T>(arr: ImmutableArray<T>, min?: 1, max?: number): arr is readonly [T, ...T[]];
export function isArrayLength<T>(arr: ImmutableArray<T>, min: 2, max?: number): arr is readonly [T, T, ...T[]];
export function isArrayLength<T>(arr: ImmutableArray<T>, min: 3, max?: number): arr is readonly [T, T, T, ...T[]];
export function isArrayLength<T>(arr: ImmutableArray<T>, min: 4, max?: number): arr is readonly [T, T, T, T, ...T[]];
export function isArrayLength<T>(arr: ImmutableArray<T>, min?: number, max?: number): boolean;
export function isArrayLength<T>(arr: ImmutableArray<T>, min = 1, max = Infinity): boolean {
	return arr.length >= min && arr.length <= max;
}

/** Assert that a value has a specific length (or length is in a specific range). */
export function assertArrayLength<T>(arr: MutableArray<T>, min: 1, max: 1): asserts arr is [T];
export function assertArrayLength<T>(arr: MutableArray<T>, min: 2, max: 2): asserts arr is [T, T];
export function assertArrayLength<T>(arr: MutableArray<T>, min: 3, max: 3): asserts arr is [T, T, T];
export function assertArrayLength<T>(arr: MutableArray<T>, min: 4, max: 4): asserts arr is [T, T, T, T];
export function assertArrayLength<T>(arr: MutableArray<T> | unknown, min?: 1, max?: number): asserts arr is [T, ...T[]];
export function assertArrayLength<T>(arr: MutableArray<T> | unknown, min: 2, max?: number): asserts arr is [T, T, ...T[]];
export function assertArrayLength<T>(arr: MutableArray<T> | unknown, min: 3, max?: number): asserts arr is [T, T, T, ...T[]];
export function assertArrayLength<T>(arr: MutableArray<T> | unknown, min: 4, max?: number): asserts arr is [T, T, T, T, ...T[]];
export function assertArrayLength<T>(arr: MutableArray<T> | unknown, min: number, max?: number): asserts arr is MutableArray<T>;
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 1, max: 1): asserts arr is readonly [T];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 2, max: 2): asserts arr is readonly [T, T];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 3, max: 3): asserts arr is readonly [T, T, T];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 4, max: 4): asserts arr is readonly [T, T, T, T];
export function assertArrayLength<T>(arr: ImmutableArray<T> | unknown, min?: 1, max?: number): asserts arr is readonly [T, ...T[]];
export function assertArrayLength<T>(arr: ImmutableArray<T> | unknown, min: 2, max?: number): asserts arr is readonly [T, T, ...T[]];
export function assertArrayLength<T>(arr: ImmutableArray<T> | unknown, min: 3, max?: number): asserts arr is readonly [T, T, T, ...T[]];
export function assertArrayLength<T>(arr: ImmutableArray<T> | unknown, min: 4, max?: number): asserts arr is readonly [T, T, T, T, ...T[]];
export function assertArrayLength<T>(arr: ImmutableArray<T> | unknown, min: number, max?: number): asserts arr is ImmutableArray<T>;
export function assertArrayLength<T>(arr: ImmutableArray<T> | unknown, min = 1, max = Infinity): asserts arr is ImmutableArray<T> {
	if (!isArray<ImmutableArray<T>>(arr) || !isArrayLength<T>(arr, min, max)) throw new AssertionError(`Must be array with length ${formatRange(min, max)}`, arr);
}

/** Get an array if it has the specified minimum length.  */
export function getArrayLength<T>(arr: MutableArray<T>, min: 1, max: 1): [T];
export function getArrayLength<T>(arr: MutableArray<T>, min: 2, max: 2): [T, T];
export function getArrayLength<T>(arr: MutableArray<T>, min: 3, max: 3): [T, T, T];
export function getArrayLength<T>(arr: MutableArray<T>, min: 4, max: 4): [T, T, T, T];
export function getArrayLength<T>(arr: MutableArray<T>, min?: 1, max?: number): [T, ...T[]];
export function getArrayLength<T>(arr: MutableArray<T>, min: 2, max?: number): [T, T, ...T[]];
export function getArrayLength<T>(arr: MutableArray<T>, min: 3, max?: number): [T, T, T, ...T[]];
export function getArrayLength<T>(arr: MutableArray<T>, min: 4, max?: number): [T, T, T, T, ...T[]];
export function getArrayLength<T>(arr: MutableArray<T>, min?: number, max?: number): MutableArray<T>;
export function getArrayLength<T>(arr: ImmutableArray<T>, min: 1, max: 1): readonly [T];
export function getArrayLength<T>(arr: ImmutableArray<T>, min: 2, max: 2): readonly [T, T];
export function getArrayLength<T>(arr: ImmutableArray<T>, min: 3, max: 3): readonly [T, T, T];
export function getArrayLength<T>(arr: ImmutableArray<T>, min: 4, max: 4): readonly [T, T, T, T];
export function getArrayLength<T>(arr: ImmutableArray<T>, min?: 1, max?: number): readonly [T, ...T[]];
export function getArrayLength<T>(arr: ImmutableArray<T>, min: 2, max?: number): readonly [T, T, ...T[]];
export function getArrayLength<T>(arr: ImmutableArray<T>, min: 3, max?: number): readonly [T, T, T, ...T[]];
export function getArrayLength<T>(arr: ImmutableArray<T>, min: 4, max?: number): readonly [T, T, T, T, ...T[]];
export function getArrayLength<T>(arr: ImmutableArray<T>, min?: number, max?: number): ImmutableArray<T>;
export function getArrayLength<T>(arr: ImmutableArray<T>, min = 1, max = Infinity): ImmutableArray<T> {
	assertArrayLength(arr, min, max);
	return arr;
}
