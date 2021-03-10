import { COMPARE } from "../sort";

/** Possible operator references. */
export type Operator = "is" | "not" | "in" | "contains" | "lt" | "lte" | "gt" | "gte";

/**
 * Function that matches an item against a target value and returns `true` if they match.
 * - Consistent with: `Dispatcher`, `Deriver`, `Comparer`, `Matcher`
 */
export type Matcher<L = unknown, R = unknown> = (item: L, target: R) => boolean;

// Use the ascending order comparison.
const { asc } = COMPARE;

/** List of matching functions along with their matcher references. */
export const MATCH: {
	readonly [K in Operator]: Matcher;
} = {
	is: (item, target) => item === target,
	not: (item, target) => item !== target,
	in: (item, target) => (target instanceof Array ? target.includes(item) : false),
	contains: (item, target) => (item instanceof Array ? item.includes(target) : false),
	lt: (item, target) => asc(item, target) < 0,
	lte: (item, target) => asc(item, target) <= 0,
	gt: (item, target) => asc(item, target) > 0,
	gte: (item, target) => asc(item, target) >= 0,
};
