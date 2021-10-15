/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ImmutableArray } from "./array.js";
import type { Deriver } from "./dispatch.js";
import { COMPARE } from "./compare.js";

/** Possible operator references. */
export type Operator = "IS" | "NOT" | "IN" | "CONTAINS" | "LT" | "LTE" | "GT" | "GTE";

/**
 * Function that matches an item against a target value and returns `true` if they match.
 * - Consistent with: `Dispatcher`, `Deriver`, `Comparer`, `Matcher`
 */
export type Matcher<L = unknown, R = unknown> = (item: L, target: R) => boolean;

/** List of matching functions along with their matcher references. */
export const MATCH: {
	readonly [K in Operator]: Matcher;
} = {
	IS: (item, target) => item === target,
	NOT: (item, target) => item !== target,
	IN: (item, target) => (target instanceof Array ? target.includes(item) : false),
	CONTAINS: (item, target) => (item instanceof Array ? item.includes(target) : false),
	LT: (item, target) => COMPARE.ASC(item, target) < 0,
	LTE: (item, target) => COMPARE.ASC(item, target) <= 0,
	GT: (item, target) => COMPARE.ASC(item, target) > 0,
	GTE: (item, target) => COMPARE.ASC(item, target) >= 0,
};

/**
 * Filter an array of items against a target value and return an array that only keeps the ones that match.
 * - Consistent with `sort()`, `search()`
 *
 * @param items The input array of items, e.g. `[1, 2, 3]`
 * @param matcher Matching function that takes `item` and `target` and returns true/false if the matching is successful.
 * @param target The target value to match each item in the array against, e.g. `2`
 * @param deriver A deriver function that extracts a specific value from an item (e.g. to compare the `.date` property in two objects).
 *
 * @returns Array with items for which the matcher function returned true.
 * - If the filtering did not remove any items the exact same input instance is returned.
 */
export function filter<L>(items: ImmutableArray<L>, matcher: Matcher<L, undefined>): ImmutableArray<L>;
export function filter<L, R>(items: ImmutableArray<L>, matcher: Matcher<L, R>, target: R): ImmutableArray<L>;
export function filter<L, R>(items: ImmutableArray<L>, matcher: Matcher<L, R>, target: R): ImmutableArray<L>;
export function filter<L, LL, R>(items: ImmutableArray<L>, matcher: Matcher<LL, R>, target: R, deriver?: Deriver<L, LL>): ImmutableArray<LL>;
export function filter(items: ImmutableArray, matcher: Matcher<any, any>, target?: unknown, deriver?: Deriver): ImmutableArray {
	if (!items.length) return items;
	const filtered = [];
	for (const item of items) if (matcher(deriver ? deriver(item) : item, target)) filtered.push(item);
	return items.length === filtered.length ? items : filtered;
}
