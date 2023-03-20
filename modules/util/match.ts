import { isArray } from "./array.js";
import { Arguments } from "./function.js";
import { rankAsc } from "./sort.js";

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

// Regular matchers.
export const isEqual: Match<[item: unknown, target: unknown]> = (item, target) => item === target;
export const notEqual: Match<[item: unknown, target: unknown]> = (item, target) => item !== target;
export const isInArray: Match<[item: unknown, target: unknown]> = (item, targets) => isArray(targets) && targets.includes(item);
export const notInArray: Match<[item: unknown, target: unknown]> = (item, targets) => isArray(targets) && !targets.includes(item);
export const isArrayWith: Match<[item: unknown, target: unknown]> = (items, target) => isArray(items) && items.includes(target);
export const isLess: Match<[item: unknown, target: unknown]> = (item, target) => rankAsc(item, target) < 0;
export const isEqualLess: Match<[item: unknown, target: unknown]> = (item, target) => rankAsc(item, target) <= 0;
export const isGreater: Match<[item: unknown, target: unknown]> = (item, target) => rankAsc(item, target) > 0;
export const isEqualGreater: Match<[item: unknown, target: unknown]> = (item, target) => rankAsc(item, target) >= 0;