import { ImmutableArray, isArray } from "./array.js";
import { isIterable } from "./iterate.js";
import { ImmutableMap } from "./map.js";
import { ImmutableObject } from "./object.js";
import { ImmutableSet, isSet } from "./set.js";

/**
 * Single entry from a map-like object.
 * - Consistency with `UnknownObject`
 * - Always readonly.
 */
export type Entry<K = unknown, T = unknown> = readonly [K, T];

/** Extract the type for the value of an entry. */
export type EntryKey<X> = X extends Entry<infer Y, unknown> ? Y : never;

/** Extract the type for the value of an entry. */
export type EntryValue<X> = X extends Entry<unknown, infer Y> ? Y : never;

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

/** Yield the entries in something that can yield entries. */
export function getEntries<K extends number, T = K>(entries: ImmutableArray<T> | ImmutableSet<K & T> | ImmutableObject<K, T> | Iterable<Entry<K, T>>): Iterable<Entry<K, T>>;
export function getEntries<K extends string, T = K>(entries: ImmutableSet<K & T> | ImmutableObject<K, T> | Iterable<Entry<K, T>>): Iterable<Entry<K, T>>;
export function getEntries<K, T = K>(entries: ImmutableArray<K & T> | ImmutableSet<K & T> | ImmutableObject<K & PropertyKey, T> | Iterable<Entry<K, T>>): Iterable<Entry<K, T>>;
export function getEntries(entries: ImmutableArray | ImmutableSet | ImmutableObject | ImmutableMap | Iterable<Entry>): Iterable<Entry> {
	if (isArray(entries) || isSet(entries)) return entries.entries();
	if (isIterable(entries)) return entries;
	return Object.entries(entries);
}
