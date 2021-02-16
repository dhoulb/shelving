/**
 * Filterer: a function that takes a single result and returns true or false.
 * - Consistent with: `Dispatcher`, `Deriver`, `Filterer`, `Comparer`, `Matcher`
 */
export type Filterer<T = unknown> = (value: T) => boolean;

/**
 * Filter an array of items for those that match a target value.
 *
 * @param input The input array of items, e.g. `[1, 2, 3]`
 * @param target The target value to match against, e.g. `2`
 * @param filterer Matching function that takes `target` and `current` and returns true/false if the matching is successful.
 *
 * @returns Array with items for which the match function returned true.
 * - If the filtering did not remove any items the exact same input instance is returned.
 */
export function filter<T>(input: ReadonlyArray<T>, filterer: Filterer<T>): ReadonlyArray<T> {
	if (!input.length) return input;
	const output: T[] = input.filter(filterer);
	return input.length === output.length ? input : output;
}
