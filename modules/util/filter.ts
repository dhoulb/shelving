import type { ImmutableArray } from "./array.js";
import type { Deriver } from "./derive.js";
import { compareAscending } from "./sort.js";
import { isObject } from "./object.js";

/** Object that can match a value against another with its `match()` function. */
export interface Matchable<L, R> {
	match(item: L, target: R): boolean;
}

/** Object that can match a value against another with its `match()` function, or a function that can do the same. */
export type Matcher<L, R> = Matchable<L, R> | ((item: L, target: R) => boolean);

/** Match two values using a `Matcher`. */
export function match<L>(item: L, matcher: Matcher<L, void>): boolean;
export function match<L, R>(item: L, matcher: Matcher<L, R>, target: R): boolean;
export function match<L, R>(item: L, matcher: Matcher<L, R | undefined>, target?: R): boolean {
	return typeof matcher === "function" ? matcher(item, target) : matcher.match(item, target);
}

/** Match two values for equality. */
export const is = (item: unknown, target: unknown) => item === target;

/** Match two values for inequality. */
export const isNot = (item: unknown, target: unknown) => item !== target;

/** Match whether `item` exists in `target` array. */
export const isIn = (item: unknown, target: unknown) => (target instanceof Array ? target.includes(item) : false);

/** Match whether `item` array contains `target`. */
export const contains = (item: unknown, target: unknown) => (item instanceof Array ? item.includes(target) : false);

/** Match whether `item` is less than `target`. */
export const isLessThan = (item: unknown, target: unknown) => compareAscending(item, target) < 0;

/** Match whether `item` is less than or equal to `target`. */
export const isLessThanOrEqual = (item: unknown, target: unknown) => compareAscending(item, target) <= 0;

/** Match whether `item` is greater than `target`. */
export const isGreaterThan = (item: unknown, target: unknown) => compareAscending(item, target) > 0;

/** Match whether `item` is greater than or equal to `target`. */
export const isGreaterThanOrEqual = (item: unknown, target: unknown) => compareAscending(item, target) >= 0;

/**
 * Match a string against a regular expression.
 *
 * @param item The item to search for the regexp in.
 * - Item is an array: recurse into each item of the array to look for strings that match.
 * - Item is an object: recurse into each property of the object to look for strings that match.
 * - Item is string: match the string against the regular expression.
 * - Item is anything else: return false (can't be matched).
 *
 * @param regexp The `RegExp` instance to match the
 */
export function matchRegExp(item: unknown, regexp: RegExp): boolean {
	// Item is array or object: recurse into it and return +1 if any item matches the regexp.
	// e.g. `rank({ title: "Big Dog", description: "etc" }, "dog")`  will return `1`
	if (isObject(item)) {
		for (const i of Object.values(item)) if (matchRegExp(i, regexp)) return true;
		return false;
	}
	// See if item is a string and matches the regexp.
	return typeof item === "string" && !!item.match(regexp);
}

/**
 * Filter an array of items against a target value and return an array that only keeps the ones that match.
 * - Consistent with `sort()`, `search()`
 *
 * @param items The input array of items, e.g. `[1, 2, 3]`
 * @param matcher Object that can match a value against another with its `match()` function, or a function that can do the same.
 * @param target The target value to match each item in the array against, e.g. `2`
 * @param deriver A deriver function that extracts a specific value from an item (e.g. to compare the `.date` property in two objects).
 *
 * @returns Array with items for which the matcher function returned true.
 * - If the filtering did not remove any items the exact same input instance is returned.
 */
export function filter<L>(items: ImmutableArray<L>, matcher: Matcher<L, void>): ImmutableArray<L>;
export function filter<L, R>(items: ImmutableArray<L>, matcher: Matcher<L, R>, target: R): ImmutableArray<L>;
export function filter<L, R>(items: ImmutableArray<L>, matcher: Matcher<L, R>, target: R): ImmutableArray<L>;
export function filter<L, LL, R>(items: ImmutableArray<L>, matcher: Matcher<LL, R>, target: R, deriver?: Deriver<L, LL>): ImmutableArray<LL>;
export function filter<L, LL, R>(items: ImmutableArray<L>, matcher: Matcher<L | LL, R | undefined>, target?: R, deriver?: Deriver<L, LL>): ImmutableArray {
	if (!items.length) return items;
	const filtered = [];
	for (const item of items) if (match(deriver ? deriver(item) : item, matcher, target)) filtered.push(item);
	return items.length === filtered.length ? items : filtered;
}
