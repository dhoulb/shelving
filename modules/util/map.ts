import { RequiredError } from "../error/RequiredError.js";
import type { Entry } from "./entry.js";
import type { AnyCaller } from "./function.js";
import { isIterable, limitItems } from "./iterate.js";

/**
 * `Map` that cannot be changed.
 *
 * @see https://shelving.cc/util/map/ImmutableMap
 */
export type ImmutableMap<K = unknown, T = unknown> = ReadonlyMap<K, T>;

/**
 * Class for a `Map` that cannot be changed (so you can extend `Map` while implementing `ImmutableMap`).
 *
 * @see https://shelving.cc/util/map/ImmutableMap
 */
export const ImmutableMap: { new <K, T>(...params: ConstructorParameters<typeof Map<K, T>>): ImmutableMap<K, T> } = Map;

/**
 * `Map` that can be changed.
 *
 * @see https://shelving.cc/util/map/MutableMap
 */
export type MutableMap<K = unknown, T = unknown> = Map<K, T>;

/**
 * Extract the type for the key of a map.
 *
 * @see https://shelving.cc/util/map/MapKey
 */
export type MapKey<X> = X extends ReadonlyMap<infer Y, unknown> ? Y : never;

/**
 * Extract the type for the value of a map.
 *
 * @see https://shelving.cc/util/map/MapValue
 */
export type MapValue<X> = X extends ReadonlyMap<unknown, infer Y> ? Y : never;

/**
 * Get the type for an item of a map in entry format.
 *
 * @see https://shelving.cc/util/map/MapItem
 */
export type MapItem<T extends ImmutableMap> = readonly [MapKey<T>, MapValue<T>];

/**
 * Things that can be converted to maps.
 *
 * @see https://shelving.cc/util/map/PossibleMap
 */
export type PossibleMap<K, T> = ImmutableMap<K, T> | Iterable<Entry<K, T>>;

/**
 * Things that can be converted to maps with string keys.
 *
 * @see https://shelving.cc/util/map/PossibleStringMap
 */
export type PossibleStringMap<K extends string, T> = PossibleMap<K, T> | { readonly [KK in K]: T };

/**
 * Is an unknown value a map?
 *
 * @param value The value to test.
 * @returns `true` if `value` is a `Map` instance, otherwise `false`.
 * @see https://shelving.cc/util/map/isMap
 */
export function isMap(value: unknown): value is ImmutableMap {
	return value instanceof Map;
}

/**
 * Assert that a value is a `Map` instance.
 *
 * @param value The value to assert.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns Nothing; narrows `value` to `ImmutableMap`.
 * @throws {RequiredError} If `value` is not a `Map` instance.
 * @see https://shelving.cc/util/map/assertMap
 */
export function assertMap(value: unknown, caller: AnyCaller = assertMap): asserts value is ImmutableMap {
	if (!isMap(value)) throw new RequiredError("Must be map", { received: value, caller });
}

/**
 * Convert an iterable to a `Map` (if it's already a `Map` it passes through unchanged).
 *
 * @param input The map, object, or iterable of entries to convert.
 * @returns An `ImmutableMap` — the input unchanged if it's already a `Map`, otherwise a new `Map`.
 * @see https://shelving.cc/util/map/getMap
 */
export function getMap<K extends string, T>(input: PossibleStringMap<K, T>): ImmutableMap<K, T>;
export function getMap<K, T>(input: PossibleMap<K, T>): ImmutableMap<K, T>;
export function getMap(input: PossibleMap<unknown, unknown> | { readonly [key: string]: unknown }): ImmutableMap<unknown, unknown> {
	return isMap(input) ? input : new Map(isIterable(input) ? input : Object.entries(input));
}

/**
 * Apply a limit to a map.
 * - Returns the input map unchanged if the limit is not smaller than its size.
 *
 * @param map The map to limit.
 * @param limit The maximum number of items to keep.
 * @returns An `ImmutableMap` with at most `limit` items (the input map unchanged if it already fits).
 * @see https://shelving.cc/util/map/limitMap
 */
export function limitMap<T>(map: ImmutableMap<T>, limit: number): ImmutableMap<T> {
	return limit > map.size ? map : new Map(limitItems(map, limit));
}

/**
 * Is an unknown value a key for an item in a map?
 *
 * @param map The map to look in.
 * @param key The candidate key to test.
 * @returns `true` if `key` exists in `map`, otherwise `false`.
 * @see https://shelving.cc/util/map/isMapItem
 */
export function isMapItem<K, V>(map: ImmutableMap<K, V>, key: unknown): key is K {
	return map.has(key as K);
}

/**
 * Assert that an unknown value is a key for an item in a map.
 *
 * @param map The map to look in.
 * @param key The candidate key to assert.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns Nothing; narrows `key` to the map's key type.
 * @throws {RequiredError} If `key` does not exist in `map`.
 * @see https://shelving.cc/util/map/assertMapItem
 */
export function assertMapItem<K, V>(map: ImmutableMap<K, V>, key: unknown, caller: AnyCaller = assertMapItem): asserts key is K {
	if (!isMapItem(map, key)) throw new RequiredError("Key must exist in map", { key, map, caller });
}

/**
 * Set an item in a map (by reference) and return the value that was set.
 *
 * @param map The mutable map to set the item on.
 * @param key The key to set.
 * @param value The value to set.
 * @returns The `value` that was set.
 * @see https://shelving.cc/util/map/setMapItem
 */
export function setMapItem<K, T>(map: MutableMap<K, T>, key: K, value: T): T {
	map.set(key, value);
	return value;
}

/**
 * Add multiple items to a map (by reference).
 *
 * @param map The mutable map to set the items on.
 * @param items Iterable of key/value entries to set.
 * @returns Nothing; mutates `map` in place.
 * @see https://shelving.cc/util/map/setMapItems
 */
export function setMapItems<K, T>(map: MutableMap<K, T>, items: Iterable<MapItem<ImmutableMap<K, T>>>): void {
	for (const [k, v] of items) map.set(k, v);
}

/**
 * Remove multiple items from a map (by reference).
 *
 * @param map The mutable map to remove the items from.
 * @param keys The keys to delete.
 * @returns Nothing; mutates `map` in place.
 * @see https://shelving.cc/util/map/removeMapItems
 */
export function removeMapItems<K, T>(map: MutableMap<K, T>, ...keys: K[]): void {
	for (const key of keys) map.delete(key);
}

/**
 * Get an item in a map, or `undefined` if it doesn't exist.
 *
 * @param map The map to read from.
 * @param key The key to look up.
 * @returns The value for `key`, or `undefined` if it doesn't exist.
 * @see https://shelving.cc/util/map/getMapItem
 */
export function getMapItem<K, T>(map: ImmutableMap<K, T>, key: K): T | undefined {
	return map.get(key);
}

/**
 * Get an item in a map, or throw `RequiredError` if it doesn't exist.
 *
 * @param map The map to read from.
 * @param key The key to look up.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns The value for `key`.
 * @throws {RequiredError} If `key` does not exist in `map`.
 * @see https://shelving.cc/util/map/requireMapItem
 */
export function requireMapItem<K, T>(map: ImmutableMap<K, T>, key: K, caller: AnyCaller = requireMapItem): T {
	if (!map.has(key)) throw new RequiredError("Key must exist in map", { key, map, caller });
	return map.get(key) as T;
}
