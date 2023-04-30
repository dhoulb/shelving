import type { ImmutableArray, MutableArray } from "./array.js";
import type { Arguments } from "./function.js";
import { isArray } from "./array.js";

/** Function that can compare two values for sorting. */
export type Compare<T, A extends Arguments = []> = (left: T, right: T, ...args: A) => number;

/**
 * Compare two unknown values in ascending order.
 * - Allows values of different types to be ranked for sorting.
 *
 * 1. Numbers and dates (ascending order: -Infinity, negative, zero, positive, Infinity, NaN)
 * 2. Strings (locale-aware order)
 * 3. `true`
 * 4. `false`
 * 5. `null`
 * 6. Unsorted values (objects that can't be converted to number or string, symbols, NaN, etc)
 * 7. `undefined`
 *
 * @param x The first value to rank.
 * @param y The second value to rank.
 *
 * @returns Number below zero if `a` is higher, number above zero if `b` is higher, or `0` if they're equally sorted.
 */
export function compareAscending(left: unknown, right: unknown): number {
	// Exactly equal is easy.
	if (left === right) return 0;

	// Switch for type.
	if (typeof left === "number" && !Number.isNaN(left)) {
		// Number rank.
		if (typeof right === "number" && !Number.isNaN(right) && right < left) return 1;
	} else if (typeof left === "string") {
		// String rank (uses locale-aware comparison).
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

/** Compare two unknown values in descending order. */
export const compareDescending = (left: unknown, right: unknown): number => 0 - compareAscending(left, right);

/**
 * Quick sort algorithm.
 * DH: We implement our own sorting algorithm so that:
 *     1. We can calculate the return true/false (whether it changed).
 *     2. We can use our own comparison function by default.
 *
 * @param items The actual list of items that's sorted in place.
 * @param compare A rank function that takes a left/right value and returns 1/0/-1 (like `Array.prototype.sort()`).
 * @param leftPointer Index in the set of items to start sorting on.
 * @param rightPointer Index in the set of items to stop sorting on.
 *
 * @return `true` if the array order changed, and `false` otherwise.
 */
function _quicksort<T, A extends Arguments>(items: MutableArray<T>, compare: Compare<T, A>, args: A, leftPointer = 0, rightPointer: number = items.length - 1): boolean {
	// Have any swaps been made?
	let changed = false;

	// Calculate the middle value.
	const pivot = Math.floor((leftPointer + rightPointer) / 2);
	const middle = items[pivot]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

	// Partitioning.
	let l = leftPointer;
	let r = rightPointer;
	while (l <= r) {
		while (compare(items[l]!, middle, ...args) < 0) l++; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		while (compare(items[r]!, middle, ...args) > 0) r--; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		if (l <= r) {
			if (l < r) {
				changed = true;
				[items[l], items[r]] = [items[r]!, items[l]!]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
			}
			l++;
			r--;
		}
	}

	// Sort the lower and upper segments.
	if (leftPointer < l - 1 && _quicksort(items, compare, args, leftPointer, l - 1)) changed = true;
	if (l < rightPointer && _quicksort(items, compare, args, l, rightPointer)) changed = true;

	// Changes were made.
	return changed;
}

/** Sort an iterable set of items using a ranker (defaults to sorting in ascending order). */
export function sortArray<T, A extends Arguments = []>(input: ImmutableArray<T> | Iterable<T>, compare: Compare<T, A> = compareAscending as unknown as Compare<T, A>, ...args: A): ImmutableArray<T> {
	if (isArray(input)) {
		if (input.length < 2) return input;
		const output = Array.from(input);
		return _quicksort<T, A>(output, compare, args) ? output : input;
	}
	const output = Array.from(input);
	_quicksort<T, A>(output, compare, args);
	return output;
}
