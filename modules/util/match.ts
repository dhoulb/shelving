import type { ImmutableArray } from "./array.js";
import type { Arguments } from "./function.js";

/** Object that can match an item against a target with its `match()` function. */
export interface Matchable<A extends Arguments = unknown[]> {
	match(...args: A): boolean;
}

/** Function that can match an item against a target. */
export type Match<A extends Arguments = unknown[]> = (...args: A) => boolean;

/** Match is either a `Matcherable` object, or matcher function. */
export type Matcher<A extends Arguments = unknown[]> = Matchable<A> | Match<A>;

/** Match two values using a `Matcher`. */
export function match<A extends Arguments>(matcher: Matcher<A>, ...args: A): boolean {
	return typeof matcher === "function" ? matcher(...args) : matcher.match(...args);
}

/** Filter an iterable set of items using a matcher. */
export function* filterItems<T, A extends Arguments = []>(items: Iterable<T>, matcher: Matcher<[T, ...A]>, ...args: A): Iterable<T> {
	for (const item of items) if (match(matcher, item, ...args)) yield item;
}

/** Filter an array (immutably) using a matcher. */
export function filterArray<T, A extends Arguments = []>(input: ImmutableArray<T>, matcher: Matcher<[T, ...A]>, ...args: A): ImmutableArray<T> {
	if (!input.length) return input;
	const output = Array.from(filterItems(input, matcher, ...args));
	return output.length === input.length ? input : output;
}
