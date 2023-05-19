import type { ImmutableArray } from "./array.js";
import type { Arguments } from "./function.js";

/** Function that can match an item against a target. */
export type Match<A extends Arguments = unknown[]> = (...args: A) => boolean;

/** Filter an iterable set of items using a matcher. */
export function* filterItems<T, A extends Arguments = []>(items: Iterable<T>, match: Match<[T, ...A]>, ...args: A): Iterable<T> {
	for (const item of items) if (match(item, ...args)) yield item;
}

/** Filter an array (immutably) using a matcher. */
export function filterArray<T, A extends Arguments = []>(input: ImmutableArray<T>, match: Match<[T, ...A]>, ...args: A): ImmutableArray<T> {
	if (!input.length) return input;
	const output = Array.from(filterItems(input, match, ...args));
	return output.length === input.length ? input : output;
}

/** Filter a sequence of values using a matcher. */
export async function* filterSequence<T, A extends Arguments = []>(sequence: AsyncIterable<T>, match: Match, ...args: A): AsyncIterable<T> {
	for await (const item of sequence) if (match(item, ...args)) yield item;
}
