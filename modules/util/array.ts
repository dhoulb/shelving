import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { interleaveItems, omitItems, pickItems } from "./iterate.js";

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

/** Is an unknown value an array (optionally with specified min/max length). */
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

/** Assert that an unknown value is an array (optionally with specified min/max length). */
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
export function assertArray<T>(value: unknown, min?: number, max?: number, caller?: AnyCaller): asserts value is ImmutableArray<T>;
export function assertArray(value: unknown, min?: number, max?: number, caller: AnyCaller = assertArray): void {
	if (!isArray(value, min, max))
		throw new RequiredError(`Must be array${min !== undefined || max !== undefined ? ` with ${min ?? 0} to ${max ?? "∞"} items` : ""}`, {
			received: value,
			caller,
		});
}

/** Convert a possible array to an array. */
export function getArray<T>(list: PossibleArray<T>): ImmutableArray<T> {
	return Array.isArray(list) ? list : Array.from(list);
}

/** Convert a possible array to an array (optionally with specified min/max length), or throw `RequiredError` if conversion fails. */
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
	const arr = getArray(list);
	assertArray(arr, min, max, caller);
	return arr;
}

/** Is an unknown value an item in a specified array or iterable? */
export function isArrayItem<T>(list: PossibleArray<T>, item: unknown): item is T {
	if (isArray(list)) list.includes(item as T);
	for (const i of list) if (i === item) return true;
	return false;
}

/** Assert that an unknown value is an item in a specified array. */
export function assertArrayItem<T>(arr: PossibleArray<T>, item: unknown, caller: AnyCaller = assertArrayItem): asserts item is T {
	if (!isArrayItem(arr, item)) throw new RequiredError("Item must exist in array", { item, array: arr, caller });
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

/** Pick multiple items from an array (immutably) and return a new array with those items (or the same array if no changes were made). */
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
		[arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
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
	const arr = requireArray(list, undefined, undefined, limitArray);
	return limit > arr.length ? arr : arr.slice(0, limit);
}

/** Count the items in an array. */
export function countArray<T>(arr: ImmutableArray<T>): number {
	return arr.length;
}

/** Interleave array items with a separator */
export function interleaveArray<T>(items: PossibleArray<T>, separator: T): ImmutableArray<T>;
export function interleaveArray<A, B>(items: PossibleArray<A>, separator: B): ImmutableArray<A | B>;
export function interleaveArray<A, B>(items: PossibleArray<A>, separator: B): ImmutableArray<A | B> {
	if (isArray<A>(items) && items.length < 2) return items; // Return same empty array if empty or only one item.
	return Array.from(interleaveItems(items, separator));
}

/** Get the first item from an array or iterable, or `undefined` if it didn't exist. */
export function getFirst<T>(items: PossibleArray<T>): T | undefined {
	if (isArray(items)) return items[0];
	for (const i of items) return i;
}

/** Get the first item from an array or iterable. */
export function requireFirst<T>(items: PossibleArray<T>, caller: AnyCaller = requireFirst): T {
	const item = getFirst(items);
	if (item === undefined) throw new RequiredError("First item is required", { items: items, caller });
	return item;
}

/** Get the last item from an array or iterable, or `undefined` if it didn't exist. */
export function getLast<T>(items: PossibleArray<T>): T | undefined {
	if (isArray(items)) return items[items.length - 1];
	let last: T | undefined;
	for (const i of items) {
		last = i;
	}
	return last;
}

/** Get the last item from an array or iterable. */
export function requireLast<T>(items: PossibleArray<T>, caller: AnyCaller = requireLast): T {
	const item = getLast(items);
	if (item === undefined) throw new RequiredError("Last item is required", { items, caller });
	return item;
}

/** Get the next item in an array or iterable. */
export function getNext<T>(items: PossibleArray<T>, item: T): T | undefined {
	let found = false;
	for (const i of items) {
		if (found) return i;
		if (i === item) found = true;
	}
}

/** Get the next item from an array or iterable. */
export function requireNext<T>(items: PossibleArray<T>, item: T, caller: AnyCaller = requireNext): T {
	const next = getNext(items, item);
	if (next === undefined) throw new RequiredError("Next item is required", { item, items, caller });
	return next;
}

/** Get the previous item in an array or iterable. */
export function getPrev<T>(items: PossibleArray<T>, value: T): T | undefined {
	let last: T | undefined;
	for (const i of items) {
		if (i === value) return last;
		last = i;
	}
}

/** Get the previous item from an array or iterable. */
export function requirePrev<T>(items: PossibleArray<T>, item: T, caller: AnyCaller = requirePrev): T {
	const prev = getPrev(items, item);
	if (prev === undefined) throw new RequiredError("Previous item is required", { item, items, caller });
	return prev;
}
