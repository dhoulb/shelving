// Types.
export type CompareFunction<T = unknown> = (left: T, right: T) => number;
export type ExtractFunction<I = unknown, O = unknown> = (value: I) => O;

/**
 * Comparison function that sorts into ascending order in a pragmatic way.
 * A sorting compare algorithm that can compare and order values of different types in a sensible manner.
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
export const compareAscending: CompareFunction = (left, right) => {
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
};

/** Inverse of `compareAscending()` to reverse the order of results. */
export const compareDescending: CompareFunction = (left, right) => 0 - compareAscending(left, right);

/** List of matching functions along with their string direction reference. */
export const directions = {
	asc: compareAscending,
	desc: compareDescending,
};

/** Allowed direction references for sorting. */
export type Direction = keyof typeof directions;

/**
 * Quick sort algorithm.
 * DH: We implement our own sorting algorithm so that:
 *     1. We can calculate the return true/false (whether it changed).
 *     2. We can use our own comparison function by default.
 *
 * @param items The actual list of items that's sorted in place.
 * @param compareFunction A compare function that takes a left/right value and returns 1/0/-1 (like `Array.prototype.sort()`).
 * @param leftPointer Index in the set of items to start sorting on.
 * @param rightPointer Index in the set of items to stop sorting on.
 *
 * @return `true` if the array order changed, and `false` otherwise.
 */
const quickSort = (
	items: unknown[],
	compareFunction: CompareFunction<unknown>,
	extractFunction: ExtractFunction<unknown, unknown> | undefined,
	leftPointer = 0,
	rightPointer: number = items.length - 1,
): boolean => {
	// Have any swaps been made?
	let changed = false;

	// Calculate the middle value.
	const pivot = Math.floor((leftPointer + rightPointer) / 2);
	const middleExtractedItem = extractFunction ? extractFunction(items[pivot]) : items[pivot];

	// Partitioning.
	let l = leftPointer;
	let r = rightPointer;
	while (l <= r) {
		while (compareFunction(extractFunction ? extractFunction(items[l]) : items[l], middleExtractedItem) < 0) l++;
		while (compareFunction(extractFunction ? extractFunction(items[r]) : items[r], middleExtractedItem) > 0) r--;
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
	if (leftPointer < l - 1 && quickSort(items, compareFunction, extractFunction, leftPointer, l - 1)) changed = true;
	if (l < rightPointer && quickSort(items, compareFunction, extractFunction, l, rightPointer)) changed = true;

	// Changes were made.
	return changed;
};

/**
 * Sort an array.
 *
 * @param items An array of items to sort. Can be of any type.
 * @param compareFunction A compare function that takes a left/right value and returns 1/0/-1 (like `Array.prototype.sort()`).
 * @param extractFunction An extract function that extracts a specific value from an item (e.g. to compare the `.date` property in two objects).
 *
 * @returns New array that is sorted (or the old array if no changes were made).
 */
export function sort<A>(items: ReadonlyArray<A>, compareFunction: CompareFunction<A>): ReadonlyArray<A>;
export function sort<A, B>(items: ReadonlyArray<A>, compareFunction: CompareFunction<B>, extractFunction?: ExtractFunction<A, B>): ReadonlyArray<A>;
export function sort(
	items: ReadonlyArray<unknown>,
	compareFunction: CompareFunction<unknown> = compareAscending,
	extractFunction?: ExtractFunction<unknown, unknown>,
): ReadonlyArray<unknown> {
	if (items.length <= 1) return items;
	const sorted = items.slice();
	return quickSort(sorted, compareFunction, extractFunction) ? sorted : items;
}

/**
 * Sort an array in ascending order (optionally specifying an extractor function).
 * @param extractFunction An extract function that takes a value and extracts the value the sorting is actually done on (e.g. to sort on an object property or deep property).
 * @returns New array that is sorted (or the old array if no changes were made).
 */
export const sortAscending = <T>(items: ReadonlyArray<T>, extractFunction?: ExtractFunction<T>): ReadonlyArray<T> =>
	sort(items, compareAscending, extractFunction);

/**
 * Sort an array in descending order (optionally specifying an extractor function).
 * @param extractFunction An extract function that takes a value and extracts the value the sorting is actually done on (e.g. to sort on an object property or deep property).
 * @returns New array that is sorted (or the old array if no changes were made).
 */
export const sortDescending = <T>(items: ReadonlyArray<T>, extractFunction?: ExtractFunction<T>): ReadonlyArray<T> =>
	sort(items, compareDescending, extractFunction);
