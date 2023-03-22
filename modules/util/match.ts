import { Arguments } from "./function.js";

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
