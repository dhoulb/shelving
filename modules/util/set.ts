import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { limitItems } from "./iterate.js";

/**
 * `Set` that cannot be changed.
 *
 * @see https://dhoulb.github.io/shelving/util/set/ImmutableSet
 */
export type ImmutableSet<T = unknown> = ReadonlySet<T>;

/**
 * `Set` that can be changed.
 *
 * @see https://dhoulb.github.io/shelving/util/set/MutableSet
 */
export type MutableSet<T = unknown> = Set<T>;

/**
 * Things that can be converted to sets.
 *
 * @see https://dhoulb.github.io/shelving/util/set/PossibleSet
 */
export type PossibleSet<T> = ImmutableSet<T> | Iterable<T>;

/**
 * Get the type of the _items_ in a set.
 *
 * @see https://dhoulb.github.io/shelving/util/set/SetItem
 */
export type SetItem<X> = X extends ReadonlySet<infer Y> ? Y : never;

/**
 * Is an unknown value a set?
 *
 * @param value The value to check.
 * @returns `true` if `value` is a `Set` instance, otherwise `false`.
 * @see https://dhoulb.github.io/shelving/util/set/isSet
 */
export function isSet(value: unknown): value is ImmutableSet {
	return value instanceof Set;
}

/**
 * Assert that a value is a `Set` instance.
 *
 * @param value The value to assert on.
 * @param caller Function to attribute a thrown error to (defaults to `assertSet`).
 * @throws {RequiredError} If `value` is not a `Set` instance.
 * @example assertSet(new Set()); // Passes.
 * @see https://dhoulb.github.io/shelving/util/set/assertSet
 */
export function assertSet(value: unknown, caller: AnyCaller = assertSet): asserts value is ImmutableSet {
	if (!isSet(value)) throw new RequiredError("Must be set", { received: value, caller });
}

/**
 * Convert a possible set to a `Set`.
 * - Returns the input unchanged when it is already a `Set`; otherwise constructs a new `Set` from the iterable.
 *
 * @param value A `Set` or any iterable of items.
 * @returns A `Set` containing the items of `value`.
 * @example getSet(["a", "b"]) // Set { "a", "b" }
 * @see https://dhoulb.github.io/shelving/util/set/getSet
 */
export function getSet<T>(value: PossibleSet<T>): ImmutableSet {
	return isSet(value) ? value : new Set(value);
}

/**
 * Apply a limit to a set.
 * - Returns the input unchanged when it already fits within `limit`.
 *
 * @param set The set to limit.
 * @param limit The maximum number of items to keep.
 * @returns A set containing at most `limit` items.
 * @example limitSet(new Set([1, 2, 3]), 2) // Set { 1, 2 }
 * @see https://dhoulb.github.io/shelving/util/set/limitSet
 */
export function limitSet<T>(set: ImmutableSet<T>, limit: number): ImmutableSet<T> {
	return limit > set.size ? set : new Set(limitItems(set, limit));
}

/**
 * Is an unknown value an item in a set?
 *
 * @param set The set to look in.
 * @param item The value to check for membership.
 * @returns `true` if `item` exists in `set`, otherwise `false`.
 * @see https://dhoulb.github.io/shelving/util/set/isSetItem
 */
export function isSetItem<T>(set: ImmutableSet<T>, item: unknown): item is T {
	return set.has(item as T);
}

/**
 * Assert that an unknown value is an item in a set.
 *
 * @param set The set to look in.
 * @param item The value to assert membership of.
 * @param caller Function to attribute a thrown error to (defaults to `assertSetItem`).
 * @throws {RequiredError} If `item` does not exist in `set`.
 * @example assertSetItem(new Set(["a"]), "a"); // Passes.
 * @see https://dhoulb.github.io/shelving/util/set/assertSetItem
 */
export function assertSetItem<T>(set: ImmutableSet<T>, item: unknown, caller: AnyCaller = assertSetItem): asserts item is T {
	if (!isSetItem(set, item)) throw new RequiredError("Item must exist in set", { item, set, caller });
}

/**
 * Add an item to a set (by reference) and return the set item.
 * - Mutates `set` in place.
 *
 * @param set The mutable set to add to.
 * @param item The item to add.
 * @returns The added `item`.
 * @example addSetItem(set, "a") // "a"
 * @see https://dhoulb.github.io/shelving/util/set/addSetItem
 */
export function addSetItem<T>(set: MutableSet<T>, item: T): T {
	set.add(item);
	return item;
}

/**
 * Add multiple items to a set (by reference).
 * - Mutates `set` in place.
 *
 * @param set The mutable set to add to.
 * @param items The items to add.
 * @returns Nothing.
 * @example addSetItems(set, "a", "b");
 * @see https://dhoulb.github.io/shelving/util/set/addSetItems
 */
export function addSetItems<T>(set: MutableSet<T>, ...items: T[]): void {
	for (const item of items) set.add(item);
}

/**
 * Remove multiple items from a set (by reference).
 * - Mutates `set` in place.
 *
 * @param set The mutable set to remove from.
 * @param items The items to remove.
 * @returns Nothing.
 * @example deleteSetItems(set, "a", "b");
 * @see https://dhoulb.github.io/shelving/util/set/deleteSetItems
 */
export function deleteSetItems<T>(set: MutableSet<T>, ...items: T[]): void {
	for (const item of items) set.delete(item);
}
