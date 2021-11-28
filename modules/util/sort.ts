import { ImmutableObject } from "./object.js";
import { ImmutableMap } from "./map.js";
import type { Entry } from "./entry.js";
import { ImmutableArray, MutableArray } from "./array.js";
import { derive, Deriver } from "./derive.js";

/** Object that can rank two values using its `rank()` function. */
export interface Rankable<T> {
	rank(left: T, right: T): number;
}

/** Object that can rank two values using its `rank()` function, or a function that can do the same. */
export type Ranker<T> = Rankable<T> | ((left: T, right: T) => number);

/** Rank two values with a `Ranker`. */
export function rank<T>(left: T, ranker: Ranker<T>, right: T) {
	return typeof ranker === "function" ? ranker(left, right) : ranker.rank(left, right);
}

/**
 * Rank two values in ascending order.
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
export function ASC(left: unknown, right: unknown): number {
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

/** Rank two values in descending order. */
export const DESC = (left: unknown, right: unknown): number => 0 - ASC(left, right);

/** Rank the keys of two entries in ascending order. */
export const KEY_ASC = ([l]: Entry, [r]: Entry): number => ASC(l, r);

/** Rank the keys of two entries in descending order. */
export const KEY_DESC = ([l]: Entry, [r]: Entry): number => DESC(l, r);

/** Rank the values of two entries in ascending order. */
export const VALUE_ASC = ([, l]: Entry, [, r]: Entry): number => ASC(l, r);

/** Rank the values of two entries in descending order. */
export const VALUE_DESC = ([, l]: Entry, [, r]: Entry): number => DESC(l, r);

/**
 * Quick sort algorithm.
 * DH: We implement our own sorting algorithm so that:
 *     1. We can calculate the return true/false (whether it changed).
 *     2. We can use our own comparison function by default.
 *
 * @param items The actual list of items that's sorted in place.
 * @param ranker A rank function that takes a left/right value and returns 1/0/-1 (like `Array.prototype.sort()`).
 * @param deriver A deriving function that picks the specific value to sort from out of the full value.
 * @param leftPointer Index in the set of items to start sorting on.
 * @param rightPointer Index in the set of items to stop sorting on.
 *
 * @return `true` if the array order changed, and `false` otherwise.
 */
function _quicksort<T>(items: MutableArray<T>, ranker: Ranker<T>, leftPointer = 0, rightPointer: number = items.length - 1): boolean {
	// Nothing to sort.
	if (items.length <= 1) return false;

	// Have any swaps been made?
	let changed = false;

	// Calculate the middle value.
	const pivot = Math.floor((leftPointer + rightPointer) / 2);
	const middle = items[pivot]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion

	// Partitioning.
	let l = leftPointer;
	let r = rightPointer;
	while (l <= r) {
		while (rank(items[l]!, ranker, middle) < 0) l++; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		while (rank(items[r]!, ranker, middle) > 0) r--; // eslint-disable-line @typescript-eslint/no-non-null-assertion
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
	if (leftPointer < l - 1 && _quicksort(items, ranker, leftPointer, l - 1)) changed = true;
	if (l < rightPointer && _quicksort(items, ranker, l, rightPointer)) changed = true;

	// Changes were made.
	return changed;
}

/** Sort an iterable set of items using a ranker (defaults to sorting in ascending order). */
export function sortItems<T>(input: Iterable<T>, ranker: Ranker<T> = ASC): ImmutableArray<T> {
	const array = Array.from(input);
	_quicksort(array, ranker);
	return array;
}

/** Sort an array using a ranker (defaults to sorting in ascending order) */
export function sortArray<T>(input: ImmutableArray<T>, ranker: Ranker<T> = ASC): ImmutableArray<T> {
	const output = Array.from(input);
	return _quicksort(output, ranker) ? output : input;
}

/**
 * Sort an iterable set of entries (defaults to sorting by key in ascending order).
 * - Always returns an array
 */
export function sortEntries<T>(input: Iterable<Entry<T>>, ranker: Ranker<Entry<T>> = KEY_ASC): ImmutableArray<Entry<T>> {
	const array = Array.from(input);
	_quicksort(array, ranker);
	return array;
}

/** Sort a map-like object using a ranker (defaults to sorting by key in ascending order). */
export function sortObject<T>(input: ImmutableObject<T>, ranker: Ranker<Entry<T>> = KEY_ASC): ImmutableObject<T> {
	const array = Object.entries(input);
	return _quicksort(array, ranker) ? Object.fromEntries(array) : input;
}

/** Sort a map using a ranker (defaults to sorting by key in ascending order). */
export function sortMap<T>(input: ImmutableMap<T>, ranker: Ranker<Entry<T>> = KEY_ASC): ImmutableMap<T> {
	const array = Array.from(input);
	return _quicksort(array, ranker) ? new Map(array) : input;
}

/** Derive a value and match it against a target value. */
export class RankDerived<T, TT> implements Rankable<T> {
	private _deriver: Deriver<T, TT>;
	private _ranker: Ranker<TT>;
	constructor(deriver: Deriver<T, TT>, ranker: Ranker<TT> = ASC) {
		this._deriver = deriver;
		this._ranker = ranker;
	}
	rank(left: T, right: T): number {
		return rank(derive(left, this._deriver), this._ranker, derive(right, this._deriver));
	}
}
