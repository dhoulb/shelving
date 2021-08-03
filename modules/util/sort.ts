import type { Deriver } from "./dispatch";
import type { ImmutableArray } from "./array";
import { Comparer, COMPARE } from "./compare";

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
		while (comparer(deriver ? deriver(items[l]) : items[l], middleExtractedItem) < 0) l++;
		while (comparer(deriver ? deriver(items[r]) : items[r], middleExtractedItem) > 0) r--;
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
export function sort(items: ImmutableArray, comparer: Comparer = COMPARE.ASC, deriver?: Deriver): ImmutableArray {
	if (items.length <= 1) return items;
	const sorted = items.slice();
	return quickSort(sorted, comparer, deriver) ? sorted : items;
}

/**
 * Sort an array in ascending order (optionally specifying an extractor function).
 * @param deriver An extract function that takes a value and extracts the value the sorting is actually done on (e.g. to sort on an object property or deep property).
 * @returns New array that is sorted (or the old array if no changes were made).
 */
export const sortAscending = <T>(items: ImmutableArray<T>, deriver?: Deriver<T>): ImmutableArray<T> => sort(items, COMPARE.ASC, deriver);

/**
 * Sort an array in descending order (optionally specifying an extractor function).
 * @param deriver An extract function that takes a value and extracts the value the sorting is actually done on (e.g. to sort on an object property or deep property).
 * @returns New array that is sorted (or the old array if no changes were made).
 */
export const sortDescending = <T>(items: ImmutableArray<T>, deriver?: Deriver<T>): ImmutableArray<T> => sort(items, COMPARE.DESC, deriver);
