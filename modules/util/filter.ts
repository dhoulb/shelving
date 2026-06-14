import type { ImmutableArray } from "./array.js";
import type { Arguments } from "./function.js";

/**
 * Function that can match an item against a target.
 *
 * @see https://dhoulb.github.io/shelving/util/filter/Match
 */
export type Match<A extends Arguments = unknown[]> = (...args: A) => boolean;

/**
 * Filter an iterable set of items using a matcher.
 *
 * @param items Iterable of items to filter.
 * @param match Matcher called with each item (plus any extra `args`); items it returns `true` for are kept.
 * @param args Extra arguments passed to `match` after each item.
 * @returns Iterable yielding only the items the matcher returned `true` for.
 * @example Array.from(filterItems([1, 2, 3], n => n > 1)) // [2, 3]
 * @see https://dhoulb.github.io/shelving/util/filter/filterItems
 */
export function* filterItems<T, A extends Arguments = []>(items: Iterable<T>, match: Match<[T, ...A]>, ...args: A): Iterable<T> {
	for (const item of items) if (match(item, ...args)) yield item;
}

/**
 * Filter an array (immutably) using a matcher.
 * - Returns the exact same array instance if no items were removed (for referential stability).
 *
 * @param input Array of items to filter.
 * @param match Matcher called with each item (plus any extra `args`); items it returns `true` for are kept.
 * @param args Extra arguments passed to `match` after each item.
 * @returns A filtered array, or the same `input` instance if nothing was removed.
 * @example filterArray([1, 2, 3], n => n > 1) // [2, 3]
 * @see https://dhoulb.github.io/shelving/util/filter/filterArray
 */
export function filterArray<T, A extends Arguments = []>(input: ImmutableArray<T>, match: Match<[T, ...A]>, ...args: A): ImmutableArray<T> {
	if (!input.length) return input;
	const output = Array.from(filterItems(input, match, ...args));
	return output.length === input.length ? input : output;
}

/**
 * Filter a sequence of values using a matcher.
 *
 * @param sequence Async iterable of items to filter.
 * @param match Matcher called with each item (plus any extra `args`); items it returns `true` for are kept.
 * @param args Extra arguments passed to `match` after each item.
 * @returns Async iterable yielding only the items the matcher returned `true` for.
 * @example for await (const n of filterSequence(stream, n => n > 1)) { ... }
 * @see https://dhoulb.github.io/shelving/util/filter/filterSequence
 */
export async function* filterSequence<T, A extends Arguments = []>(sequence: AsyncIterable<T>, match: Match, ...args: A): AsyncIterable<T> {
	for await (const item of sequence) if (match(item, ...args)) yield item;
}
