import { isArray } from "./array.js";
import { rankAsc } from "./sort.js";

/** Object that can match an item against a target with its `match()` function. */
export interface Matchable<L = unknown, R = unknown> {
	match(item: L, target: R): boolean;
}

/** Function that can match an item against a target. */
export type Match<L = unknown, R = unknown> = (item: L, target: R) => boolean;

/** Match is either a `Matcherable` object, or matcher function. */
export type Matcher<L = unknown, R = unknown> = Matchable<L, R> | Match<L, R>;

/** Match two values using a `Matcher`. */
export function match<L>(item: L, matcher: Matcher<L, void>): boolean;
export function match<L, R>(item: L, matcher: Matcher<L, R>, target: R): boolean;
export function match<L, R>(item: L, matcher: Matcher<L, R | undefined>, target?: R): boolean {
	return typeof matcher === "function" ? matcher(item, target) : matcher.match(item, target);
}

// Regular matchers.
export const isEqual: Match<unknown, unknown> = (item, target) => item === target;
export const notEqual: Match<unknown, unknown> = (item, target) => item !== target;
export const isInArray: Match<unknown, unknown> = (item, targets) => isArray(targets) && targets.includes(item);
export const notInArray: Match<unknown, unknown> = (item, targets) => isArray(targets) && !targets.includes(item);
export const isArrayWith: Match<unknown, unknown> = (items, target) => isArray(items) && items.includes(target);
export const isLess: Match<unknown, unknown> = (item, target) => rankAsc(item, target) < 0;
export const isEqualLess: Match<unknown, unknown> = (item, target) => rankAsc(item, target) <= 0;
export const isGreater: Match<unknown, unknown> = (item, target) => rankAsc(item, target) > 0;
export const isEqualGreater: Match<unknown, unknown> = (item, target) => rankAsc(item, target) >= 0;
