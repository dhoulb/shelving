import { compareAscending } from "./sort";

// Types.
export type FilterFunction<T = unknown> = (value: T) => boolean;
export type MatchFunction<L = unknown, R = unknown> = (target: L, current: R) => boolean;

/** Match whether current value is exactly equal to target value. */
export const matchIs: MatchFunction = (target: unknown, current: unknown) => target === current;

/** Match whether current value is not exactly equal to target value. */
export const matchNot: MatchFunction = (target: unknown, current: unknown) => target !== current;

/** Match whether current value is in target value array. */
export const matchIn: MatchFunction = (target: unknown, current: unknown) => (target instanceof Array ? target.includes(current) : false);

/** Match whether current value is an array containing target value. */
export const matchContains: MatchFunction = (target: unknown, current: unknown) => (current instanceof Array ? current.includes(target) : false);

/** Match whether current value is less than target value. */
export const matchLT: MatchFunction = (target: unknown, current: unknown) => compareAscending(current, target) < 0;

/** Match whether current value is less than or equal to target value. */
export const matchLTE: MatchFunction = (target: unknown, current: unknown) => compareAscending(current, target) <= 0;

/** Match whether current value is greater than target value. */
export const matchGT: MatchFunction = (target: unknown, current: unknown) => compareAscending(current, target) > 0;

/** Match whether current value is greater than or equal to target value. */
export const matchGTE: MatchFunction = (target: unknown, current: unknown) => compareAscending(current, target) >= 0;

/** List of matching functions along with their matcher references. */
export const matchers = {
	is: matchIs,
	not: matchNot,
	in: matchIn,
	contains: matchContains,
	lt: matchLT,
	lte: matchLTE,
	gt: matchGT,
	gte: matchGTE,
};

/** Allowed matcher references for filtering. */
export type Matcher = keyof typeof matchers;

/**
 * Filter an array of items for those that match a target value.
 *
 * @param input The input array of items, e.g. `[1, 2, 3]`
 * @param target The target value to match against, e.g. `2`
 * @param matchFunction Matching function that takes `target` and `current` and returns true/false if the matching is successful.
 *
 * @returns Array with items for which the match function returned true.
 * - If the filtering did not remove any items the exact same input instance is returned.
 */
export function filter<T>(input: ReadonlyArray<T>, filterFunction: FilterFunction<T>): ReadonlyArray<T> {
	if (!input.length) return input;
	const output: T[] = input.filter(filterFunction);
	return input.length === output.length ? input : output;
}
