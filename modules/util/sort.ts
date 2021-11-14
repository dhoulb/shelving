import type { Deriver } from "./derive.js";
import type { ImmutableArray } from "./array.js";

/** Object that can compare two values using its `compare()` function. */
export interface Comparable<T> {
	compare(left: T, right: T): number;
}

/** Object that can compare two values using its `compare()` function, or a function that can do the same. */
export type Comparer<T> = Comparable<T> | ((left: T, right: T) => number);

/** Compare two values with a `Comparer`. */
export function compare<T>(left: T, comparer: Comparer<T>, right: T) {
	return typeof comparer === "function" ? comparer(left, right) : comparer.compare(left, right);
}

/**
 * Compare two values in ascending order.
 * - Allows values of different types to be compared for sorting.
 *
 * 1. Numbers and dates (ascending order: -Infinity, negative, zero, positive, Infinity, NaN)
 * 2. Strings (locale-aware order)
 * 3. `true`
 * 4. `false`
 * 5. `null`
 * 6. Unsorted values (objects that can't be converted to number or string, symbols, NaN, etc)
 * 7. `undefined`
 *
 * @param x The first value to compare.
 * @param y The second value to compare.
 *
 * @returns Number below zero if `a` is higher, number above zero if `b` is higher, or `0` if they're equally sorted.
 */
export function compareAscending(left: unknown, right: unknown): number {
	// Exactly equal is easy.
	if (left === right) return 0;

	// Switch for type.
	if (typeof left === "number" && !Number.isNaN(left)) {
		// Number compare.
		if (typeof right === "number" && !Number.isNaN(right) && right < left) return 1;
	} else if (typeof left === "string") {
		// String compare (uses locale-aware comparison).
		if (typeof right === "string") return left.localeCompare(right);
		// right is higher if number.
		else if (typeof right === "number") return 1;
	} else if (left === true) {
		// right is higher if number, string.
		if ((typeof right === "number" && !Number.isNaN(right)) || typeof right === "string") return 1;
	} else if (left === false) {
		// right is higher if number, string.
		if ((typeof right === "number" && !Number.isNaN(right)) || typeof right === "string" || right === true) return 1;
	} else if (left === null) {
		// right is higher if number, string, boolean.
		if ((typeof right === "number" && !Number.isNaN(right)) || typeof right === "string" || typeof right === "boolean") return 1;
	} else if (typeof left !== "undefined") {
		// Anything else, e.g. object, array, symbol, NaN.
		// right is higher if number, string, boolean, null.
		if ((typeof right === "number" && !Number.isNaN(right)) || typeof right === "string" || typeof right === "boolean" || right === null) return 1;
		// Undefined is lower, anything else is equal.
		else if (typeof right !== "undefined") return 0;
	} else {
		// Both undefined.
		if (typeof right === "undefined") return 0;
		// right is higher if not undefined
		return 1;
	}

	// Otherwise a is higher.
	return -1;
}

/** Compare two values in descending order. */
export function compareDescending(left: unknown, right: unknown): number {
	return 0 - compareAscending(left, right);
}

/**
 * Quick sort algorithm.
 * DH: We implement our own sorting algorithm so that:
 *     1. We can calculate the return true/false (whether it changed).
 *     2. We can use our own comparison function by default.
 *
 * @param items The actual list of items that's sorted in place.
 * @param comparer A compare function that takes a left/right value and returns 1/0/-1 (like `Array.prototype.sort()`).
 * @param deriver A deriving function that picks the specific value to sort from out of the full value.
 * @param leftPointer Index in the set of items to start sorting on.
 * @param rightPointer Index in the set of items to stop sorting on.
 *
 * @return `true` if the array order changed, and `false` otherwise.
 */
const quickSort = (
	items: unknown[],
	comparer: Comparer<unknown>,
	deriver: Deriver<unknown, unknown> | undefined,
	leftPointer = 0,
	rightPointer: number = items.length - 1,
): boolean => {
	// Have any swaps been made?
	let changed = false;

	// Calculate the middle value.
	const pivot = Math.floor((leftPointer + rightPointer) / 2);
	const middleExtractedItem = deriver ? deriver(items[pivot]) : items[pivot];

	// Partitioning.
	let l = leftPointer;
	let r = rightPointer;
	while (l <= r) {
		while (compare(deriver ? deriver(items[l]) : items[l], comparer, middleExtractedItem) < 0) l++;
		while (compare(deriver ? deriver(items[r]) : items[r], comparer, middleExtractedItem) > 0) r--;
		if (l <= r) {
			if (l < r) {
				changed = true;
				[items[l], items[r]] = [items[r], items[l]];
			}
			l++;
			r--;
		}
	}

	// Sort the lower and upper segments.
	if (leftPointer < l - 1 && quickSort(items, comparer, deriver, leftPointer, l - 1)) changed = true;
	if (l < rightPointer && quickSort(items, comparer, deriver, l, rightPointer)) changed = true;

	// Changes were made.
	return changed;
};

/**
 * Sort an array.
 * - Consistent with `filter()`, `search()`
 *
 * @param items An array of items to sort. Can be of any type.
 * @param comparer A comparer function that takes a left/right value and returns 1/0/-1 (like `Array.prototype.sort()`).
 * @param deriver A deriver function that extracts a specific value from an item (e.g. to compare the `.date` property in two objects).
 *
 * @returns New array that is sorted (or the old array if no changes were made).
 */
export function sort<T>(items: ImmutableArray<T>): ImmutableArray<T>;
export function sort<T>(items: ImmutableArray<T>, comparer: Comparer<T>): ImmutableArray<T>;
export function sort<T, TT>(items: ImmutableArray<T>, comparer: Comparer<TT>, deriver?: Deriver<T, TT>): ImmutableArray<T>;
export function sort(items: ImmutableArray, comparer: Comparer<unknown> = compareAscending, deriver?: Deriver): ImmutableArray {
	if (items.length <= 1) return items;
	const sorted = items.slice();
	return quickSort(sorted, comparer, deriver) ? sorted : items;
}

/**
 * Sort an array in ascending order (optionally specifying an extractor function).
 * @param deriver An extract function that takes a value and extracts the value the sorting is actually done on (e.g. to sort on an object property or deep property).
 * @returns New array that is sorted (or the old array if no changes were made).
 */
export const sortAscending = <T>(items: ImmutableArray<T>, deriver?: Deriver<T>): ImmutableArray<T> => sort(items, compareAscending, deriver);

/**
 * Sort an array in descending order (optionally specifying an extractor function).
 * @param deriver An extract function that takes a value and extracts the value the sorting is actually done on (e.g. to sort on an object property or deep property).
 * @returns New array that is sorted (or the old array if no changes were made).
 */
export const sortDescending = <T>(items: ImmutableArray<T>, deriver?: Deriver<T>): ImmutableArray<T> => sort(items, compareDescending, deriver);
