import { compareAscending, compareDescending, CompareFunction } from "./compare";

/**
 * Function that extracts a value from another value.
 * - e.g. So you can sort an array of objects by their `.date` key.
 */
export type ExtractFunction<I = unknown, O = unknown> = (value: I) => O;

/**
 * Quick sort algorithm.
 * DH: We implement our own sorting algorithm so that:
 *     1. We can calculate the return true/false (whether it changed).
 *     2. We can use our own comparison function by default.
 *
 * @param items The actual list of items that's sorted in place.
 * @param compare A compare function that takes a left/right value and returns 1/0/-1 (like `Array.prototype.sort()`).
 * @param leftPointer Index in the set of items to start sorting on.
 * @param rightPointer Index in the set of items to stop sorting on.
 *
 * @return `true` if the array order changed, and `false` otherwise.
 */
const quickSort = (
	items: unknown[],
	compare: CompareFunction<unknown>,
	extract: ExtractFunction<unknown, unknown> | undefined,
	leftPointer = 0,
	rightPointer: number = items.length - 1,
): boolean => {
	// Have any swaps been made?
	let changed = false;

	// Calculate the middle value.
	const pivot = Math.floor((leftPointer + rightPointer) / 2);
	const middleExtractedItem = extract ? extract(items[pivot]) : items[pivot];

	// Partitioning.
	let l = leftPointer;
	let r = rightPointer;
	while (l <= r) {
		while (compare(extract ? extract(items[l]) : items[l], middleExtractedItem) < 0) l++;
		while (compare(extract ? extract(items[r]) : items[r], middleExtractedItem) > 0) r--;
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
	if (leftPointer < l - 1 && quickSort(items, compare, extract, leftPointer, l - 1)) changed = true;
	if (l < rightPointer && quickSort(items, compare, extract, l, rightPointer)) changed = true;

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
