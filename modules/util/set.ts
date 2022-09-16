import { AssertionError } from "../error/AssertionError.js";
import { limitItems } from "./iterate.js";

/** `Set` that cannot be changed. */
export type ImmutableSet<T = unknown> = ReadonlySet<T>;

/** `Set` that can be changed. */
export type MutableSet<T = unknown> = Set<T>;

/** Things that can be converted to sets. */
export type PossibleSet<T> = ImmutableSet<T> | Iterable<T>;

/** Get the type of the _items_ in a set. */
export type SetItem<X> = X extends ReadonlySet<infer Y> ? Y : never;

/** Is an unknown value a set? */
export const isSet = <T extends ImmutableSet>(v: T | unknown): v is T => v instanceof Set;

/** Is an unknown value an item in a set? */
export const isSetItem = <T>(set: ImmutableSet<T>, item: T | unknown): item is T => set.has(item as T);

/** Assert that a value is a `Set` instance. */
export function assertSet<T extends ImmutableSet>(v: T | unknown): asserts v is T {
	if (!isSet(v)) throw new AssertionError(`Must be set`, v);
}

/** Convert an iterable to a `Set` (if it's already a `Set` it passes through unchanged). */
export function getSet<T>(iterable: PossibleSet<T>): ImmutableSet<T> {
	return isSet(iterable) ? iterable : new Set(iterable);
}

/** Add an item to a set (by reference) and return the set item. */
export function addSetItem<T>(set: MutableSet<T>, item: T): T {
	set.add(item);
	return item;
}

/** Add multiple items to a set (by reference). */
export function addSetItems<T>(set: MutableSet<T>, ...items: T[]): void {
	for (const item of items) set.add(item);
}

/** Remove multiple items from a set (by reference). */
export function deleteSetItems<T>(set: MutableSet<T>, ...items: T[]): void {
	for (const item of items) set.delete(item);
}

/** Apply a limit to a set. */
export function limitSet<T>(set: ImmutableSet<T>, limit: number): ImmutableSet<T> {
	return limit > set.size ? set : new Set(limitItems(set, limit));
}
