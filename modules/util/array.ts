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
export function isArray(value: unknown): value is ImmutableArray {
	return Array.isArray(value);
}

/** Assert that an unknown value is an array. */
export function assertArray<T>(arr: unknown): asserts arr is ImmutableArray<T> {
	if (!isArray(arr)) throw new AssertionError("Must be array", { received: arr, caller: assertArray });
}

/** Is an unknown value an item in a specified array? */
export function isArrayItem<T>(arr: ImmutableArray<T>, item: unknown): item is T {
	return arr.includes(item as T);
}

/** Assert that an unknown value is an item in a specified array. */
export function assertArrayItem<T>(arr: ImmutableArray<T>, item: unknown): asserts item is T {
	if (!isArrayItem(arr, item)) throw new AssertionError("Item must exist in array", { item, array: arr, caller: assertArrayItem });
}

/** Convert an iterable to an array (if its not already an array). */
export function getArray<T>(list: PossibleArray<T>): ImmutableArray<T> {
	return isArray(list) ? list : Array.from(list);
}

/** Add multiple items to an array (immutably) and return a new array with those items (or the same array if no changes were made). */
export function withArrayItems<T>(list: PossibleArray<T>, ...add: T[]): ImmutableArray<T> {
	const arr = Array.from(list);
	const extras = add.filter(_doesNotInclude, arr);
	return extras.length ? [...arr, ...extras] : isArray(list) ? list : arr;
}
function _doesNotInclude<T>(this: T[], value: T) {
	return !this.includes(value);
}

/** Pick multiple items from an array (immutably) and return a new array without those items (or the same array if no changes were made). */
export function pickArrayItems<T>(items: PossibleArray<T>, ...pick: T[]): ImmutableArray<T> {
	const arr = Array.from(pickItems(items, ...pick));
	return isArray(items) && arr.length === items.length ? items : arr;
}

/** Remove multiple items from an array (immutably) and return a new array without those items (or the same array if no changes were made). */
export function omitArrayItems<T>(items: PossibleArray<T>, ...omit: T[]): ImmutableArray<T> {
	const filtered = Array.from(omitItems(items, ...omit));
	return isArray(items) && filtered.length === items.length ? items : filtered;
}

/** Toggle an item in and out of an array (immutably) and return a new array with or without the specified items (or the same array if no changes were made). */
export function toggleArrayItems<T>(items: PossibleArray<T>, ...toggle: T[]): ImmutableArray<T> {
	const arr = Array.from(items);
	const extras = toggle.filter(_doesNotInclude, arr);
	const filtered = arr.filter(_doesNotInclude, toggle);
	return extras.length ? [...filtered, ...extras] : filtered.length !== arr.length ? filtered : isArray(items) ? items : arr;
}

/** Return a shuffled version of an array or iterable. */
export function shuffleArray<T>(items: PossibleArray<T>): ImmutableArray<T> {
	const arr = Array.from(items);
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		// biome-ignore lint/style/noNonNullAssertion: We know these keys are set.
		[arr[i], arr[j]] = [arr[j]!, arr[i]!];
	}
	return arr;
}

/**
 * Add an item to an array (by reference) and return the item.
 * - Skip items that already exist.
 */
export function addArrayItem<T>(arr: MutableArray<T>, item: T): T {
	if (arr.indexOf(item) < 0) arr.push(item);
	return item;
}

/**
 * Add multiple items to an array (by reference).
 * - Skip items that already exist.
 */
export function addArrayItems<T>(arr: MutableArray<T>, ...items: T[]): void {
	for (const item of items) if (arr.indexOf(item) < 0) arr.push(item);
}

/**
 * Remove multiple items from an array (by reference).
 * - Skip items that already exist.
 */
export function deleteArrayItems<T>(arr: MutableArray<T>, ...items: T[]): void {
	for (let i = arr.length - 1; i >= 0; i--) if (i in arr && items.includes(arr[i] as T)) arr.splice(i, 1);
}

/** Return an array of the unique items in an array. */
export function getUniqueArray<T>(list: PossibleArray<T>): ImmutableArray<T> {
	const output: MutableArray<T> = [];
	for (const item of list) if (!output.includes(item)) output.push(item);
	return isArray(list) && list.length === output.length ? list : output;
}

/** Apply a limit to an array. */
export function limitArray<T>(list: PossibleArray<T>, limit: number): ImmutableArray<T> {
	const arr = getArray(list);
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
export function isArrayLength<T>(arr: ImmutableArray<T>, min = 1, max = Number.POSITIVE_INFINITY): boolean {
	return arr.length >= min && arr.length <= max;
}

/** Assert that an array has a specific length (or length is in a specific range). */
export function assertArrayLength<T>(arr: MutableArray<T>, min: 1, max: 1): asserts arr is [T];
export function assertArrayLength<T>(arr: MutableArray<T>, min: 2, max: 2): asserts arr is [T, T];
export function assertArrayLength<T>(arr: MutableArray<T>, min: 3, max: 3): asserts arr is [T, T, T];
export function assertArrayLength<T>(arr: MutableArray<T>, min: 4, max: 4): asserts arr is [T, T, T, T];
export function assertArrayLength<T>(arr: MutableArray<T>, min?: 1, max?: number): asserts arr is [T, ...T[]];
export function assertArrayLength<T>(arr: MutableArray<T>, min: 2, max?: number): asserts arr is [T, T, ...T[]];
export function assertArrayLength<T>(arr: MutableArray<T>, min: 3, max?: number): asserts arr is [T, T, T, ...T[]];
export function assertArrayLength<T>(arr: MutableArray<T>, min: 4, max?: number): asserts arr is [T, T, T, T, ...T[]];
export function assertArrayLength<T>(arr: MutableArray<T>, min: number, max?: number): asserts arr is MutableArray<T>;
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 1, max: 1): asserts arr is readonly [T];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 2, max: 2): asserts arr is readonly [T, T];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 3, max: 3): asserts arr is readonly [T, T, T];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 4, max: 4): asserts arr is readonly [T, T, T, T];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min?: 1, max?: number): asserts arr is readonly [T, ...T[]];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 2, max?: number): asserts arr is readonly [T, T, ...T[]];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 3, max?: number): asserts arr is readonly [T, T, T, ...T[]];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: 4, max?: number): asserts arr is readonly [T, T, T, T, ...T[]];
export function assertArrayLength<T>(arr: ImmutableArray<T>, min: number, max?: number): asserts arr is ImmutableArray<T>;
export function assertArrayLength<T>(arr: ImmutableArray<T>, min = 1, max = Number.POSITIVE_INFINITY): asserts arr is ImmutableArray<T> {
	if (!isArrayLength<T>(arr, min, max))
		throw new AssertionError(`Must be array with length ${formatRange(min, max)}`, { received: arr, caller: assertArrayLength });
}

/** Require that an array if has the specified minimum length, or throw `RequiredError` if is not. */
export function requireArrayLength<T>(arr: MutableArray<T>, min: 1, max: 1): [T];
export function requireArrayLength<T>(arr: MutableArray<T>, min: 2, max: 2): [T, T];
export function requireArrayLength<T>(arr: MutableArray<T>, min: 3, max: 3): [T, T, T];
export function requireArrayLength<T>(arr: MutableArray<T>, min: 4, max: 4): [T, T, T, T];
export function requireArrayLength<T>(arr: MutableArray<T>, min?: 1, max?: number): [T, ...T[]];
export function requireArrayLength<T>(arr: MutableArray<T>, min: 2, max?: number): [T, T, ...T[]];
export function requireArrayLength<T>(arr: MutableArray<T>, min: 3, max?: number): [T, T, T, ...T[]];
export function requireArrayLength<T>(arr: MutableArray<T>, min: 4, max?: number): [T, T, T, T, ...T[]];
export function requireArrayLength<T>(arr: MutableArray<T>, min?: number, max?: number): MutableArray<T>;
export function requireArrayLength<T>(arr: ImmutableArray<T>, min: 1, max: 1): readonly [T];
export function requireArrayLength<T>(arr: ImmutableArray<T>, min: 2, max: 2): readonly [T, T];
export function requireArrayLength<T>(arr: ImmutableArray<T>, min: 3, max: 3): readonly [T, T, T];
export function requireArrayLength<T>(arr: ImmutableArray<T>, min: 4, max: 4): readonly [T, T, T, T];
export function requireArrayLength<T>(arr: ImmutableArray<T>, min?: 1, max?: number): readonly [T, ...T[]];
export function requireArrayLength<T>(arr: ImmutableArray<T>, min: 2, max?: number): readonly [T, T, ...T[]];
export function requireArrayLength<T>(arr: ImmutableArray<T>, min: 3, max?: number): readonly [T, T, T, ...T[]];
export function requireArrayLength<T>(arr: ImmutableArray<T>, min: 4, max?: number): readonly [T, T, T, T, ...T[]];
export function requireArrayLength<T>(arr: ImmutableArray<T>, min?: number, max?: number): ImmutableArray<T>;
export function requireArrayLength<T>(arr: ImmutableArray<T>, min = 1, max = Number.POSITIVE_INFINITY): ImmutableArray<T> {
	if (!isArrayLength<T>(arr, min, max))
		throw new RequiredError(`Must be array with length ${formatRange(min, max)}`, { received: arr, caller: requireArrayLength });
	return arr;
}
