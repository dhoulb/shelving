import { AssertionError } from "../error/AssertionError.js";
import { limitItems } from "./iterate.js";

/** `Set` that cannot be changed. */
export type ImmutableSet<T = unknown> = ReadonlySet<T>;

/** `Set` that can be changed. */
export type MutableSet<T = unknown> = Set<T>;

/** Things that can be converted to sets. */
export type PossibleSet<T> = ImmutableSet<T> | Iterable<T>;

/** Is an unknown value a set? */
export const isSet = <T extends ImmutableSet>(v: T | unknown): v is T => v instanceof Set;

/** Assert that a value is a `Set` instance. */
export function assertSet<T extends ImmutableSet>(v: T | unknown): asserts v is T {
	if (!isSet(v)) throw new AssertionError(`Must be set`, v);
}

/** Convert an iterable to a `Set` (if it's already a `Set` it passes through unchanged). */
export function getSet<T>(iterable: PossibleSet<T>): ImmutableSet<T> {
	return isSet(iterable) ? iterable : new Set(iterable);
}

/** Apply a limit to a set. */
export function limitSet<T>(set: ImmutableSet<T>, limit: number): ImmutableSet<T> {
	return limit > set.size ? set : new Set(limitItems(set, limit));
}
