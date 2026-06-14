import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { interleaveItems, isIterable, omitItems, pickItems } from "./iterate.js";

/**
 * Mutable array: an array that can be changed.
 * - Consistency with `MutableObject<T>` and `ImmutableArray<T>`
 *
 * @see https://dhoulb.github.io/shelving/util/array/MutableArray
 */
export type MutableArray<T = unknown> = T[];

/**
 * Immutable array: an array that cannot be changed.
 * - Consistency with `ImmutableObject<T>` and `MutableArray<T>`
 *
 * @see https://dhoulb.github.io/shelving/util/array/ImmutableArray
 */
export type ImmutableArray<T = unknown> = readonly T[];

/**
 * Get the type of the _items_ in an array.
 *
 * @see https://dhoulb.github.io/shelving/util/array/ArrayItem
 */
export type ArrayItem<T extends ImmutableArray> = T[number];

/**
 * Things that can be converted to arrays.
 *
 * @see https://dhoulb.github.io/shelving/util/array/PossibleArray
 */
export type PossibleArray<T> = ImmutableArray<T> | Iterable<T>;

/**
 * Is an unknown value an array (optionally with specified min/max length)?
 *
 * @param value The value to test.
 * @param min Minimum number of items the array must contain (defaults to `0`).
 * @param max Maximum number of items the array may contain (defaults to `Infinity`).
 * @returns `true` if `value` is an array within the length bounds, narrowing its type.
 *
 * @example isArray([1, 2, 3]); // true
 * @example isArray([1], 2, 2); // false
 *
 * @see https://dhoulb.github.io/shelving/util/array/isArray
 */
export function isArray<T>(arr: MutableArray<T>, min: 1, max: 1): arr is [T];
export function isArray<T>(arr: MutableArray<T>, min: 2, max: 2): arr is [T, T];
export function isArray<T>(arr: MutableArray<T>, min: 3, max: 3): arr is [T, T, T];
export function isArray<T>(arr: MutableArray<T>, min?: 1, max?: number): arr is [T, ...T[]];
export function isArray<T>(arr: MutableArray<T>, min: 2, max?: number): arr is [T, T, ...T[]];
export function isArray<T>(arr: MutableArray<T>, min: 3, max?: number): arr is [T, T, T, ...T[]];
export function isArray<T>(arr: MutableArray<T>, min?: number, max?: number): arr is MutableArray<T>;
export function isArray<T>(arr: ImmutableArray<T>, min: 1, max: 1): arr is readonly [T];
export function isArray<T>(arr: ImmutableArray<T>, min: 2, max: 2): arr is readonly [T, T];
export function isArray<T>(arr: ImmutableArray<T>, min: 3, max: 3): arr is readonly [T, T, T];
export function isArray<T>(arr: ImmutableArray<T>, min?: 1, max?: number): arr is readonly [T, ...T[]];
export function isArray<T>(arr: ImmutableArray<T>, min: 2, max?: number): arr is readonly [T, T, ...T[]];
export function isArray<T>(arr: ImmutableArray<T>, min: 3, max?: number): arr is readonly [T, T, T, ...T[]];
export function isArray<T>(value: unknown, min?: number, max?: number): value is ImmutableArray<T>;
export function isArray(value: unknown, min = 0, max = Number.POSITIVE_INFINITY): boolean {
	return Array.isArray(value) && value.length >= min && value.length <= max;
}

/**
 * Assert that an unknown value is an array (optionally with specified min/max length).
 *
 * @param value The value to assert.
 * @param min Minimum number of items the array must contain (defaults to `0`).
 * @param max Maximum number of items the array may contain (defaults to `Infinity`).
 * @param caller Function to attribute a thrown error to (defaults to `assertArray` itself).
 * @throws {RequiredError} If `value` is not an array within the length bounds.
 *
 * @example assertArray([1, 2, 3]); // (passes)
 * @example assertArray("nope"); // throws RequiredError
 *
 * @see https://dhoulb.github.io/shelving/util/array/assertArray
 */
export function assertArray<T>(arr: MutableArray<T>, min: 1, max: 1, caller?: AnyCaller): asserts arr is [T];
export function assertArray<T>(arr: MutableArray<T>, min: 2, max: 2, caller?: AnyCaller): asserts arr is [T, T];
export function assertArray<T>(arr: MutableArray<T>, min: 3, max: 3, caller?: AnyCaller): asserts arr is [T, T, T];
export function assertArray<T>(arr: MutableArray<T>, min?: 1, max?: number, caller?: AnyCaller): asserts arr is [T, ...T[]];
export function assertArray<T>(arr: MutableArray<T>, min: 2, max?: number, caller?: AnyCaller): asserts arr is [T, T, ...T[]];
export function assertArray<T>(arr: MutableArray<T>, min: 3, max?: number, caller?: AnyCaller): asserts arr is [T, T, T, ...T[]];
export function assertArray<T>(arr: MutableArray<T>, min: number, max?: number, caller?: AnyCaller): asserts arr is MutableArray<T>;
export function assertArray<T>(arr: ImmutableArray<T>, min: 1, max: 1, caller?: AnyCaller): asserts arr is readonly [T];
export function assertArray<T>(arr: ImmutableArray<T>, min: 2, max: 2, caller?: AnyCaller): asserts arr is readonly [T, T];
export function assertArray<T>(arr: ImmutableArray<T>, min: 3, max: 3, caller?: AnyCaller): asserts arr is readonly [T, T, T];
export function assertArray<T>(arr: ImmutableArray<T>, min?: 1, max?: number, caller?: AnyCaller): asserts arr is readonly [T, ...T[]];
export function assertArray<T>(arr: ImmutableArray<T>, min: 2, max?: number, caller?: AnyCaller): asserts arr is readonly [T, T, ...T[]];
export function assertArray<T>(arr: ImmutableArray<T>, min: 3, max?: number, caller?: AnyCaller): asserts arr is readonly [T, T, T, ...T[]];
export function assertArray<T>(arr: ImmutableArray<T>, min?: number, max?: number, caller?: AnyCaller): asserts arr is ImmutableArray<T>;
export function assertArray(value: unknown, min?: number, max?: number, caller: AnyCaller = assertArray): void {
	if (!isArray(value, min, max))
		throw new RequiredError(`Must be array${min !== undefined || max !== undefined ? ` with ${min ?? 0} to ${max ?? "∞"} items` : ""}`, {
			received: value,
			caller,
		});
}

/**
 * Convert a possible array to an array.
 *
 * @param list The value to convert (an array is returned as-is, an iterable is collected into a new array).
 * @returns An array of the items, or `undefined` if `list` could not be converted.
 *
 * @example getArray(new Set([1, 2])); // [1, 2]
 * @example getArray(123); // undefined
 *
 * @see https://dhoulb.github.io/shelving/util/array/getArray
 */
export function getArray(list: unknown): ImmutableArray<unknown> | undefined {
	return Array.isArray(list) ? list : isIterable(list) ? Array.from(list) : undefined;
}

/**
 * Convert a possible array to an array (optionally with specified min/max length), or throw `RequiredError` if conversion fails.
 *
 * @param list The value to convert (an array or iterable of items).
 * @param min Minimum number of items the array must contain (defaults to `0`).
 * @param max Maximum number of items the array may contain (defaults to `Infinity`).
 * @param caller Function to attribute a thrown error to (defaults to `requireArray` itself).
 * @returns An array of the items within the length bounds.
 * @throws {RequiredError} If `list` cannot be converted to an array within the length bounds.
 *
 * @example requireArray(new Set([1, 2])); // [1, 2]
 * @example requireArray([], 1); // throws RequiredError
 *
 * @see https://dhoulb.github.io/shelving/util/array/requireArray
 */
export function requireArray<T>(arr: MutableArray<T>, min: 1, max: 1, caller?: AnyCaller): [T];
export function requireArray<T>(arr: MutableArray<T>, min: 2, max: 2, caller?: AnyCaller): [T, T];
export function requireArray<T>(arr: MutableArray<T>, min: 3, max: 3, caller?: AnyCaller): [T, T, T];
export function requireArray<T>(arr: MutableArray<T>, min?: 1, max?: number, caller?: AnyCaller): [T, ...T[]];
export function requireArray<T>(arr: MutableArray<T>, min: 2, max?: number, caller?: AnyCaller): [T, T, ...T[]];
export function requireArray<T>(arr: MutableArray<T>, min: 3, max?: number, caller?: AnyCaller): [T, T, T, ...T[]];
export function requireArray<T>(arr: MutableArray<T>, min?: number, max?: number, caller?: AnyCaller): MutableArray<T>;
export function requireArray<T>(arr: ImmutableArray<T>, min: 1, max: 1, caller?: AnyCaller): readonly [T];
export function requireArray<T>(arr: ImmutableArray<T>, min: 2, max: 2, caller?: AnyCaller): readonly [T, T];
export function requireArray<T>(arr: ImmutableArray<T>, min: 3, max: 3, caller?: AnyCaller): readonly [T, T, T];
export function requireArray<T>(arr: ImmutableArray<T>, min?: 1, max?: number, caller?: AnyCaller): readonly [T, ...T[]];
export function requireArray<T>(arr: ImmutableArray<T>, min: 2, max?: number, caller?: AnyCaller): readonly [T, T, ...T[]];
export function requireArray<T>(arr: ImmutableArray<T>, min: 3, max?: number, caller?: AnyCaller): readonly [T, T, T, ...T[]];
export function requireArray<T>(list: PossibleArray<T>, min?: number, max?: number, caller?: AnyCaller): ImmutableArray<T>;
export function requireArray<T>(list: PossibleArray<T>, min?: number, max?: number, caller: AnyCaller = requireArray): ImmutableArray<T> {
	const arr = Array.isArray(list) ? list : Array.from(list);
	assertArray(arr, min, max, caller);
	return arr;
}

/**
 * Is an unknown value an item in a specified array or iterable?
 *
 * @param list The array or iterable to search.
 * @param item The value to look for.
 * @returns `true` if `item` exists in `list`, narrowing its type.
 *
 * @example isArrayItem([1, 2, 3], 2); // true
 * @example isArrayItem([1, 2, 3], 9); // false
 *
 * @see https://dhoulb.github.io/shelving/util/array/isArrayItem
 */
export function isArrayItem<T>(list: PossibleArray<T>, item: unknown): item is T {
	if (isArray(list)) list.includes(item as T);
	for (const i of list) if (i === item) return true;
	return false;
}

/**
 * Assert that an unknown value is an item in a specified array.
 *
 * @param arr The array or iterable to search.
 * @param item The value to look for.
 * @param caller Function to attribute a thrown error to (defaults to `assertArrayItem` itself).
 * @throws {RequiredError} If `item` does not exist in `arr`.
 *
 * @example assertArrayItem([1, 2, 3], 2); // (passes)
 * @example assertArrayItem([1, 2, 3], 9); // throws RequiredError
 *
 * @see https://dhoulb.github.io/shelving/util/array/assertArrayItem
 */
export function assertArrayItem<T>(arr: PossibleArray<T>, item: unknown, caller: AnyCaller = assertArrayItem): asserts item is T {
	if (!isArrayItem(arr, item)) throw new RequiredError("Item must exist in array", { item, array: arr, caller });
}

/**
 * Add multiple items to an array (immutably) and return a new array with those items (or the same array if no changes were made).
 *
 * @param list The array or iterable to add to.
 * @param add The items to add (items already present are skipped).
 * @returns A new array including the added items, or the same array if nothing changed.
 *
 * @example withArrayItems([1, 2], 2, 3); // [1, 2, 3]
 *
 * @see https://dhoulb.github.io/shelving/util/array/withArrayItems
 */
export function withArrayItems<T>(list: PossibleArray<T>, ...add: T[]): ImmutableArray<T> {
	const arr = Array.from(list);
	const extras = add.filter(_doesNotInclude, arr);
	return extras.length ? [...arr, ...extras] : isArray(list) ? list : arr;
}
function _doesNotInclude<T>(this: T[], value: T) {
	return !this.includes(value);
}

/**
 * Add an item to an array (immutably) and return a new array with that item (or the same array if no changes were made).
 *
 * @param items The array or iterable to add to.
 * @param add The item to add (skipped if already present).
 * @returns A new array including the added item, or the same array if nothing changed.
 *
 * @example withArrayItem([1, 2], 3); // [1, 2, 3]
 *
 * @see https://dhoulb.github.io/shelving/util/array/withArrayItem
 */
export const withArrayItem: <T>(items: PossibleArray<T>, add: T) => ImmutableArray<T> = withArrayItems;

/**
 * Pick multiple items from an array (immutably) and return a new array with those items (or the same array if no changes were made).
 *
 * @param items The array or iterable to pick from.
 * @param pick The items to keep.
 * @returns A new array containing only the picked items, or the same array if nothing changed.
 *
 * @example pickArrayItems([1, 2, 3], 1, 3); // [1, 3]
 *
 * @see https://dhoulb.github.io/shelving/util/array/pickArrayItems
 */
export function pickArrayItems<T>(items: PossibleArray<T>, ...pick: T[]): ImmutableArray<T> {
	const arr = Array.from(pickItems(items, ...pick));
	return isArray(items) && arr.length === items.length ? items : arr;
}

/**
 * Pick an item from an array (immutably) and return a new array with that item (or the same array if no changes were made).
 *
 * @param items The array or iterable to pick from.
 * @param pick The item to keep.
 * @returns A new array containing only the picked item, or the same array if nothing changed.
 *
 * @example pickArrayItem([1, 2, 3], 2); // [2]
 *
 * @see https://dhoulb.github.io/shelving/util/array/pickArrayItem
 */
export const pickArrayItem: <T>(items: PossibleArray<T>, pick: T) => ImmutableArray<T> = pickArrayItems;

/**
 * Remove multiple items from an array (immutably) and return a new array without those items (or the same array if no changes were made).
 *
 * @param items The array or iterable to remove from.
 * @param omit The items to remove.
 * @returns A new array without the omitted items, or the same array if nothing changed.
 *
 * @example omitArrayItems([1, 2, 3], 2); // [1, 3]
 *
 * @see https://dhoulb.github.io/shelving/util/array/omitArrayItems
 */
export function omitArrayItems<T>(items: PossibleArray<T>, ...omit: T[]): ImmutableArray<T> {
	const filtered = Array.from(omitItems(items, ...omit));
	return isArray(items) && filtered.length === items.length ? items : filtered;
}

/**
 * Remove an item from an array (immutably) and return a new array without that item (or the same array if no changes were made).
 *
 * @param items The array or iterable to remove from.
 * @param omit The item to remove.
 * @returns A new array without the omitted item, or the same array if nothing changed.
 *
 * @example omitArrayItem([1, 2, 3], 2); // [1, 3]
 *
 * @see https://dhoulb.github.io/shelving/util/array/omitArrayItem
 */
export const omitArrayItem: <T>(items: PossibleArray<T>, omit: T) => ImmutableArray<T> = omitArrayItems;

/**
 * Toggle an item in and out of an array (immutably) and return a new array with or without the specified items (or the same array if no changes were made).
 *
 * @param items The array or iterable to toggle within.
 * @param toggle The items to toggle (added if absent, removed if present).
 * @returns A new array with the items toggled, or the same array if nothing changed.
 *
 * @example toggleArrayItems([1, 2], 2, 3); // [1, 3]
 *
 * @see https://dhoulb.github.io/shelving/util/array/toggleArrayItems
 */
export function toggleArrayItems<T>(items: PossibleArray<T>, ...toggle: T[]): ImmutableArray<T> {
	const arr = Array.from(items);
	const extras = toggle.filter(_doesNotInclude, arr);
	const filtered = arr.filter(_doesNotInclude, toggle);
	return extras.length ? [...filtered, ...extras] : filtered.length !== arr.length ? filtered : isArray(items) ? items : arr;
}

/**
 * Toggle an item in and out of an array (immutably) and return a new array with or without the specified item (or the same array if no changes were made).
 *
 * @param items The array or iterable to toggle within.
 * @param toggle The item to toggle (added if absent, removed if present).
 * @returns A new array with the item toggled, or the same array if nothing changed.
 *
 * @example toggleArrayItem([1, 2], 2); // [1]
 *
 * @see https://dhoulb.github.io/shelving/util/array/toggleArrayItem
 */
export const toggleArrayItem: <T>(items: PossibleArray<T>, toggle: T) => ImmutableArray<T> = toggleArrayItems;

/**
 * Return a shuffled version of an array or iterable.
 *
 * @param items The array or iterable to shuffle.
 * @returns A new array containing the same items in random order.
 *
 * @example shuffleArray([1, 2, 3]); // e.g. [2, 3, 1]
 *
 * @see https://dhoulb.github.io/shelving/util/array/shuffleArray
 */
export function shuffleArray<T>(items: PossibleArray<T>): ImmutableArray<T> {
	const arr = Array.from(items);
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
	}
	return arr;
}

/**
 * Add an item to an array (by reference) and return the item.
 * - Skip items that already exist.
 *
 * @param arr The array to add to (modified in place).
 * @param item The item to add.
 * @returns The added `item`.
 *
 * @example addArrayItem(arr, 3); // 3 (and `arr` now contains `3`)
 *
 * @see https://dhoulb.github.io/shelving/util/array/addArrayItem
 */
export function addArrayItem<T>(arr: MutableArray<T>, item: T): T {
	if (arr.indexOf(item) < 0) arr.push(item);
	return item;
}

/**
 * Add multiple items to an array (by reference).
 * - Skip items that already exist.
 *
 * @param arr The array to add to (modified in place).
 * @param items The items to add.
 * @example addArrayItems(arr, 3, 4); // (`arr` now contains `3` and `4`)
 * @see https://dhoulb.github.io/shelving/util/array/addArrayItems
 */
export function addArrayItems<T>(arr: MutableArray<T>, ...items: T[]): void {
	for (const item of items) if (arr.indexOf(item) < 0) arr.push(item);
}

/**
 * Remove multiple items from an array (by reference).
 *
 * @param arr The array to remove from (modified in place).
 * @param items The items to remove.
 * @example deleteArrayItems(arr, 2, 3); // (`arr` no longer contains `2` or `3`)
 * @see https://dhoulb.github.io/shelving/util/array/deleteArrayItems
 */
export function deleteArrayItems<T>(arr: MutableArray<T>, ...items: T[]): void {
	for (let i = arr.length - 1; i >= 0; i--) if (i in arr && items.includes(arr[i] as T)) arr.splice(i, 1);
}

/**
 * Remove an item from an array (by reference).
 *
 * @param arr The array to remove from (modified in place).
 * @param item The item to remove.
 * @example deleteArrayItem(arr, 2); // (`arr` no longer contains `2`)
 * @see https://dhoulb.github.io/shelving/util/array/deleteArrayItem
 */
export const deleteArrayItem: <T>(arr: MutableArray<T>, item: T) => void = deleteArrayItems;

/**
 * Return an array of the unique items in an array.
 *
 * @param list The array or iterable to deduplicate.
 * @returns A new array with duplicate items removed, or the same array if all items were already unique.
 * @example getUniqueArray([1, 2, 2, 3]) // [1, 2, 3]
 * @see https://dhoulb.github.io/shelving/util/array/getUniqueArray
 */
export function getUniqueArray<T>(list: PossibleArray<T>): ImmutableArray<T> {
	const output: MutableArray<T> = [];
	for (const item of list) if (!output.includes(item)) output.push(item);
	return isArray(list) && list.length === output.length ? list : output;
}

/**
 * Apply a limit to an array.
 *
 * @param list The array or iterable to limit.
 * @param limit The maximum number of items to keep.
 * @returns An array of at most `limit` items, or the same array if it was already within the limit.
 * @throws {RequiredError} If `list` cannot be converted to an array.
 * @example limitArray([1, 2, 3, 4], 2) // [1, 2]
 * @see https://dhoulb.github.io/shelving/util/array/limitArray
 */
export function limitArray<T>(list: PossibleArray<T>, limit: number): ImmutableArray<T> {
	const arr = requireArray(list, undefined, undefined, limitArray);
	return limit > arr.length ? arr : arr.slice(0, limit);
}

/**
 * Count the items in an array.
 *
 * @param arr The array to count.
 * @returns The number of items in `arr`.
 * @example countArray([1, 2, 3]) // 3
 * @see https://dhoulb.github.io/shelving/util/array/countArray
 */
export function countArray<T>(arr: ImmutableArray<T>): number {
	return arr.length;
}

/**
 * Interleave array items with a separator.
 *
 * @param items The array or iterable to interleave.
 * @param separator The value to insert between each pair of items.
 * @returns A new array with `separator` inserted between items, or the same array if it had fewer than two items.
 * @example interleaveArray([1, 2, 3], 0) // [1, 0, 2, 0, 3]
 * @see https://dhoulb.github.io/shelving/util/array/interleaveArray
 */
export function interleaveArray<T>(items: PossibleArray<T>, separator: T): ImmutableArray<T>;
export function interleaveArray<A, B>(items: PossibleArray<A>, separator: B): ImmutableArray<A | B>;
export function interleaveArray<A, B>(items: PossibleArray<A>, separator: B): ImmutableArray<A | B> {
	if (isArray<A>(items) && items.length < 2) return items; // Return same empty array if empty or only one item.
	return Array.from(interleaveItems(items, separator));
}

/**
 * Return a new array with a new value replacing a specific index in the array (or the same array if the value was unchanged).
 *
 * @param arr The array to update.
 * @param index The index to replace.
 * @param value The new value to set at `index`.
 * @returns A new array with `value` at `index`, or the same array if the value was unchanged.
 * @example withArrayIndex([1, 2, 3], 1, 9) // [1, 9, 3]
 * @see https://dhoulb.github.io/shelving/util/array/withArrayIndex
 */
export function withArrayIndex<T>(arr: ImmutableArray<T>, index: number, value: T): ImmutableArray<T> {
	if (arr[index] === value) return arr;
	return [...arr.slice(0, index), value, ...arr.slice(index + 1)];
}

/**
 * Return a new array without a specific index in the array (or the same array if the value was unchanged).
 *
 * @param arr The array to update.
 * @param index The index to remove.
 * @returns A new array without `index`, or the same array if nothing changed.
 * @example omitArrayIndex([1, 2, 3], 1) // [1, 3]
 * @see https://dhoulb.github.io/shelving/util/array/omitArrayIndex
 */
export function omitArrayIndex<T>(arr: ImmutableArray<T>, index: number): ImmutableArray<T> {
	const output = [...arr.slice(0, index), ...arr.slice(index + 1)];
	return arr.length !== output.length ? output : arr;
}

/**
 * Get the first item from an array or iterable, or `undefined` if it didn't exist.
 *
 * @param items The array or iterable to read from.
 * @returns The first item, or `undefined` if `items` is empty.
 * @example getFirst([1, 2, 3]) // 1
 * @see https://dhoulb.github.io/shelving/util/array/getFirst
 */
export function getFirst<T>(items: PossibleArray<T>): T | undefined {
	if (isArray(items)) return items[0];
	for (const i of items) return i;
}

/**
 * Get the first item from an array or iterable.
 *
 * @param items The array or iterable to read from.
 * @param caller Function to attribute a thrown error to (defaults to `requireFirst` itself).
 * @returns The first item.
 * @throws {RequiredError} If `items` is empty.
 * @example requireFirst([1, 2, 3]) // 1
 * @see https://dhoulb.github.io/shelving/util/array/requireFirst
 */
export function requireFirst<T>(items: PossibleArray<T>, caller: AnyCaller = requireFirst): T {
	const item = getFirst(items);
	if (item === undefined) throw new RequiredError("First item is required", { items: items, caller });
	return item;
}

/**
 * Get the last item from an array or iterable, or `undefined` if it didn't exist.
 *
 * @param items The array or iterable to read from.
 * @returns The last item, or `undefined` if `items` is empty.
 * @example getLast([1, 2, 3]) // 3
 * @see https://dhoulb.github.io/shelving/util/array/getLast
 */
export function getLast<T>(items: PossibleArray<T>): T | undefined {
	if (isArray(items)) return items[items.length - 1];
	let last: T | undefined;
	for (const i of items) {
		last = i;
	}
	return last;
}

/**
 * Get the last item from an array or iterable.
 *
 * @param items The array or iterable to read from.
 * @param caller Function to attribute a thrown error to (defaults to `requireLast` itself).
 * @returns The last item.
 * @throws {RequiredError} If `items` is empty.
 * @example requireLast([1, 2, 3]) // 3
 * @see https://dhoulb.github.io/shelving/util/array/requireLast
 */
export function requireLast<T>(items: PossibleArray<T>, caller: AnyCaller = requireLast): T {
	const item = getLast(items);
	if (item === undefined) throw new RequiredError("Last item is required", { items, caller });
	return item;
}

/**
 * Get the next item in an array or iterable.
 *
 * @param items The array or iterable to search.
 * @param item The item to find the successor of.
 * @returns The item following `item`, or `undefined` if `item` is missing or last.
 * @example getNext([1, 2, 3], 2) // 3
 * @see https://dhoulb.github.io/shelving/util/array/getNext
 */
export function getNext<T>(items: PossibleArray<T>, item: T): T | undefined {
	let found = false;
	for (const i of items) {
		if (found) return i;
		if (i === item) found = true;
	}
}

/**
 * Get the next item from an array or iterable.
 *
 * @param items The array or iterable to search.
 * @param item The item to find the successor of.
 * @param caller Function to attribute a thrown error to (defaults to `requireNext` itself).
 * @returns The item following `item`.
 * @throws {RequiredError} If `item` is missing or has no successor.
 * @example requireNext([1, 2, 3], 2) // 3
 * @see https://dhoulb.github.io/shelving/util/array/requireNext
 */
export function requireNext<T>(items: PossibleArray<T>, item: T, caller: AnyCaller = requireNext): T {
	const next = getNext(items, item);
	if (next === undefined) throw new RequiredError("Next item is required", { item, items, caller });
	return next;
}

/**
 * Get the previous item in an array or iterable.
 *
 * @param items The array or iterable to search.
 * @param value The item to find the predecessor of.
 * @returns The item preceding `value`, or `undefined` if `value` is missing or first.
 * @example getPrev([1, 2, 3], 2) // 1
 * @see https://dhoulb.github.io/shelving/util/array/getPrev
 */
export function getPrev<T>(items: PossibleArray<T>, value: T): T | undefined {
	let last: T | undefined;
	for (const i of items) {
		if (i === value) return last;
		last = i;
	}
}

/**
 * Get the previous item from an array or iterable.
 *
 * @param items The array or iterable to search.
 * @param item The item to find the predecessor of.
 * @param caller Function to attribute a thrown error to (defaults to `requirePrev` itself).
 * @returns The item preceding `item`.
 * @throws {RequiredError} If `item` is missing or has no predecessor.
 * @example requirePrev([1, 2, 3], 2) // 1
 * @see https://dhoulb.github.io/shelving/util/array/requirePrev
 */
export function requirePrev<T>(items: PossibleArray<T>, item: T, caller: AnyCaller = requirePrev): T {
	const prev = getPrev(items, item);
	if (prev === undefined) throw new RequiredError("Previous item is required", { item, items, caller });
	return prev;
}
