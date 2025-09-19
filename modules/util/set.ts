import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
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
export function isSet(value: unknown): value is ImmutableSet {
	return value instanceof Set;
}

/** Assert that a value is a `Set` instance. */
export function assertSet(value: unknown, caller: AnyCaller = assertSet): asserts value is ImmutableSet {
	if (!isSet(value)) throw new RequiredError("Must be set", { received: value, caller });
}

/** Convert a possible set to a `Set`. */
export function getSet<T>(value: PossibleSet<T>): ImmutableSet {
	return isSet(value) ? value : new Set(value);
}

/** Apply a limit to a set. */
export function limitSet<T>(set: ImmutableSet<T>, limit: number): ImmutableSet<T> {
	return limit > set.size ? set : new Set(limitItems(set, limit));
}

/** Is an unknown value an item in a set? */
export function isSetItem<I, T>(set: ImmutableSet<T>, item: unknown): item is T {
	return set.has(item as T);
}

/** Assert that an unknown value is an item in a set. */
export function assertSetItem<I, T>(set: ImmutableSet<T>, item: unknown, caller: AnyCaller = assertSetItem): asserts item is T {
	if (!isSetItem(set, item)) throw new RequiredError("Item must exist in set", { item, set, caller });
}

/** Add an item to a set (by reference) and return the set item. */
export function addSetItem<I, T>(set: MutableSet<T>, item: T): T {
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
