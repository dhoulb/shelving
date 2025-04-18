import { NotFoundError } from "../error/NotFoundError.js";
import { ValidationError } from "../error/ValidationError.js";
import type { Entry } from "./entry.js";
import { isIterable, limitItems } from "./iterate.js";

/** `Map` that cannot be changed. */
export type ImmutableMap<K = unknown, T = unknown> = ReadonlyMap<K, T>;

/** Class for a `Map` that cannot be changed (so you can extend `Map` while implementing `ImmutableMap`). */
export const ImmutableMap: { new <K, T>(...params: ConstructorParameters<typeof Map<K, T>>): ImmutableMap<K, T> } = Map;

/** `Map` that can be changed. */
export type MutableMap<K = unknown, T = unknown> = Map<K, T>;

/** Extract the type for the value of a map. */
export type MapKey<X> = X extends ReadonlyMap<infer Y, unknown> ? Y : never;

/** Extract the type for the value of a map. */
export type MapValue<X> = X extends ReadonlyMap<unknown, infer Y> ? Y : never;

/** Get the type for an item of a map in entry format. */
export type MapItem<T extends ImmutableMap> = readonly [MapKey<T>, MapValue<T>];

/** Things that can be converted to maps. */
export type PossibleMap<K, T> = ImmutableMap<K, T> | Iterable<Entry<K, T>>;

/** Things that can be converted to maps with string keys. */
export type PossibleStringMap<K extends string, T> = PossibleMap<K, T> | { readonly [KK in K]: T };

/** Is an unknown value a map? */
export function isMap(value: unknown): value is ImmutableMap {
	return value instanceof Map;
}

/** Assert that a value is a `Map` instance. */
export function assertMap(value: unknown): asserts value is ImmutableMap {
	if (!isMap(value)) throw new ValidationError("Must be map", value);
}

/** Is an unknown value a key for an item in a map? */
export function isMapItem<K, V>(map: ImmutableMap<K, V>, key: unknown): key is K {
	return map.has(key as K);
}

/** Assert that an unknown value is a key for an item in a map. */
export function assertMapItem<K, V>(map: ImmutableMap<K, V>, key: unknown): asserts key is K {
	if (!isMapItem(map, key)) throw new ValidationError("Must be map item", key);
}

/** Convert an iterable to a `Map` (if it's already a `Map` it passes through unchanged). */
export function getMap<K extends string, T>(input: PossibleStringMap<K, T>): ImmutableMap<K, T>;
export function getMap<K, T>(input: PossibleMap<K, T>): ImmutableMap<K, T>;
export function getMap(input: PossibleMap<unknown, unknown> | { readonly [key: string]: unknown }): ImmutableMap<unknown, unknown> {
	return isMap(input) ? input : new Map(isIterable(input) ? input : Object.entries(input));
}

/** Apply a limit to a map. */
export function limitMap<T>(map: ImmutableMap<T>, limit: number): ImmutableMap<T> {
	return limit > map.size ? map : new Map(limitItems(map, limit));
}

/** Function that lets new items in a map be created and updated by calling a `reduce()` callback that receives the existing value. */
export function setMapItem<K, T>(map: MutableMap<K, T>, key: K, value: T): T {
	map.set(key, value);
	return value;
}

/** Add multiple items to a set (by reference). */
export function setMapItems<K, T>(map: MutableMap<K, T>, items: Iterable<MapItem<ImmutableMap<K, T>>>): void {
	for (const [k, v] of items) map.set(k, v);
}

/** Remove multiple items from a set (by reference). */
export function removeMapItems<K, T>(map: MutableMap<K, T>, ...keys: K[]): void {
	for (const key of keys) map.delete(key);
}

/** Get an item in a map or throw an error if it doesn't exist. */
export function getMapItem<K, T>(map: ImmutableMap<K, T>, key: K): T {
	if (!map.has(key)) throw new NotFoundError("Map item is required");
	return map.get(key) as T;
}

/** Get an item in a map or `undefined` if it doesn't exist. */
export function getOptionalMapItem<K, T>(map: ImmutableMap<K, T>, key: K): T | undefined {
	return map.get(key);
}
