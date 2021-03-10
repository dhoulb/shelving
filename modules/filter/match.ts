import type { ImmutableArray } from "../array";
import type { Deriver } from "../function";
import { COMPARE } from "../sort";

/** Possible operator references. */
export type Operator = "is" | "not" | "in" | "contains" | "lt" | "lte" | "gt" | "gte";

/**
 * Function that matches one value against another and returns `true` if they match.
 * - Consistent with: `Dispatcher`, `Deriver`, `Filterer`, `Comparer`, `Matcher`
 */
export type Matcher<L = unknown, R = unknown> = (left: L, right: R) => boolean;

// Use the ascending order comparison.
const { asc } = COMPARE;

/** List of matching functions along with their matcher references. */
export const MATCH: {
	readonly [K in Operator]: Matcher;
} = {
	is: (left, right) => left === right,
	not: (left, right) => left !== right,
	in: (left, right) => (right instanceof Array ? right.includes(left) : false),
	contains: (left, right) => (left instanceof Array ? left.includes(right) : false),
	lt: (left, right) => asc(left, right) < 0,
	lte: (left, right) => asc(left, right) <= 0,
	gt: (left, right) => asc(left, right) > 0,
	gte: (left, right) => asc(left, right) >= 0,
};

/**
 * Match an array of items against a target value and return an array that only keeps the ones that
 *
 * @param lefts The input array of items, e.g. `[1, 2, 3]`
 * @param matcher Matching function that takes `target` and `current` and returns true/false if the matching is successful.
 * @param left The target value to match each element in the array against, e.g. `2`
 * @param deriver A deriver function that extracts a specific value from an item (e.g. to compare the `.date` property in two objects).
 *
 * @returns Array with items for which the match function returned true.
 * - If the filtering did not remove any items the exact same input instance is returned.
 */
export function match<T>(lefts: ImmutableArray<T>, matcher: Matcher<T>, right: T): ImmutableArray<T>;
export function match<T, TT>(lefts: ImmutableArray<T>, matcher: Matcher<TT>, right: T, deriver?: Deriver<T, TT>): ImmutableArray<TT>;
export function match(lefts: ImmutableArray<unknown>, matcher: Matcher<unknown>, right: unknown, deriver?: Deriver<unknown, unknown>): ImmutableArray<unknown> {
	if (!lefts.length) return lefts;
	const filtered = [];
	for (const left of lefts) if (matcher(deriver ? deriver(left) : left, right)) filtered.push(left);
	return lefts.length === filtered.length ? lefts : filtered;
}
