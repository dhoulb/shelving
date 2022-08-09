import type { ImmutableObject } from "./object.js";
import { ImmutableArray, isArray } from "./array.js";
import { ImmutableMap, isMap } from "./map.js";

/**
 * Single entry from a map-like object.
 * - Consistency with `UnknownObject`
 * - Always readonly.
 */
export type Entry<K, T> = readonly [K, T];

/** Extract the type for the value of an entry. */
export type EntryKeyType<X> = X extends Entry<infer Y, unknown> ? Y : never;

/** Extract the type for the value of an entry. */
export type EntryValueType<X> = X extends Entry<unknown, infer Y> ? Y : never;

/** Extract the key from an object entry. */
export const getEntryKey = <K, T>([k]: Entry<K, T>): K => k;

/** Extract the value from an object entry. */
export const getEntryValue = <K, T>([, v]: Entry<K, T>): T => v;

/** Yield the keys of an iterable set of entries. */
export function* getEntryKeys<K, T>(input: Iterable<Entry<K, T>>): Iterable<K> {
	for (const [k] of input) yield k;
}

/** Yield the values of an iterable set of entries. */
export function* getEntryValues<K, T>(input: Iterable<Entry<K, T>>): Iterable<T> {
	for (const [, v] of input) yield v;
}

/** Yield the entries in an object, array, or map. */
export function getEntries<T>(input: ImmutableObject<T> | ImmutableArray<T> | ImmutableMap<string | number, T>): Iterable<Entry<string | number, T>> {
	if (isArray(input) || isMap(input)) return input.entries();
	return Object.entries(input);
}
