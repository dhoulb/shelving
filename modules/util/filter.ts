import type { ImmutableArray } from "./array.js";
import { match, Matcher } from "./match.js";

/** Filter an iterable set of items using a matcher (and optionally a target value). */
export function filterItems<L>(input: Iterable<L>, matcher: Matcher<L, void>): Iterable<L>;
export function filterItems<L, R>(input: Iterable<L>, matcher: Matcher<L, R>, target: R): Iterable<L>;
export function* filterItems<L, R>(input: Iterable<L>, matcher: Matcher<L, R | undefined>, target?: R): Iterable<L> {
	for (const item of input) if (match(item, matcher, target)) yield item;
}

/** Filter an array using a matcher (and optionally a target value). */
export function filterArray<L>(input: ImmutableArray<L>, matcher: Matcher<L, void>): ImmutableArray<L>;
export function filterArray<L, R>(input: ImmutableArray<L>, matcher: Matcher<L, R>, target: R): ImmutableArray<L>;
export function filterArray<L, R>(input: ImmutableArray<L>, matcher: Matcher<L, R | undefined>, target?: R): ImmutableArray<L> {
	if (!input.length) return input;
	const output = Array.from(filterItems(input, matcher, target));
	return output.length === input.length ? input : output;
}
