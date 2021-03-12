import { COMPARE } from "../sort";

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
