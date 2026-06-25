import type { ImmutableArray } from "./array.js";
import { isArray } from "./array.js";
import { isIterable } from "./iterate.js";
import type { ImmutableMap } from "./map.js";
import type { ImmutableObject } from "./object.js";
import type { ImmutableSet } from "./set.js";
import { isSet } from "./set.js";

/**
 * Single key/value entry from a map-like object.
 * - Consistency with `UnknownObject`
 * - Always readonly.
 *
 * @see https://shelving.cc/util/entry/Entry
 */
export type Entry<K = unknown, T = unknown> = readonly [K, T];

/**
 * Extract the key type from an `Entry`.
 *
 * @see https://shelving.cc/util/entry/EntryKey
 */
export type EntryKey<X> = X extends Entry<infer Y, unknown> ? Y : never;

/**
 * Extract the value type from an `Entry`.
 *
 * @see https://shelving.cc/util/entry/EntryValue
 */
export type EntryValue<X> = X extends Entry<unknown, infer Y> ? Y : never;

/**
 * Turn an `Entry` type back into an object with a single property.
 * i.e. `EntryObject<Entry<"a", string>>` produces `{ a: string }`
 *
 * @see https://shelving.cc/util/entry/EntryObject
 */
export type EntryObject<T extends Entry<PropertyKey, unknown>> = { readonly [E in T as E[0]]: E[1] };

/**
 * Extract the key from an object entry.
 *
 * @param entry The `[key, value]` entry to read from.
 * @returns The key (first element) of the entry.
 * @see https://shelving.cc/util/entry/getEntryKey
 */
export function getEntryKey<K, T>([k]: Entry<K, T>): K {
	return k;
}

/**
 * Extract the value from an object entry.
 *
 * @param entry The `[key, value]` entry to read from.
 * @returns The value (second element) of the entry.
 * @see https://shelving.cc/util/entry/getEntryValue
 */
export function getEntryValue<K, T>([, v]: Entry<K, T>): T {
	return v;
}

/**
 * Yield the keys of an iterable set of entries.
 *
 * @param input Iterable of `[key, value]` entries.
 * @returns Iterable yielding each entry's key.
 * @see https://shelving.cc/util/entry/getEntryKeys
 */
export function* getEntryKeys<K, T>(input: Iterable<Entry<K, T>>): Iterable<K> {
	for (const [k] of input) yield k;
}

/**
 * Yield the values of an iterable set of entries.
 *
 * @param input Iterable of `[key, value]` entries.
 * @returns Iterable yielding each entry's value.
 * @see https://shelving.cc/util/entry/getEntryValues
 */
export function* getEntryValues<K, T>(input: Iterable<Entry<K, T>>): Iterable<T> {
	for (const [, v] of input) yield v;
}

/**
 * Yield the entries from one or more entry-yielding sources (sets, objects, maps, arrays, or iterables of entries).
 *
 * @param input One or more sources that can yield `[key, value]` entries.
 * @returns Iterable yielding the combined entries from every input.
 * @see https://shelving.cc/util/entry/getEntries
 */
export function getEntries<K extends string, T = K>(
	...input: (ImmutableSet<K & T> | Partial<ImmutableObject<K, T>> | Iterable<Entry<K, T>>)[]
): Iterable<Entry<K, T>>;
export function getEntries<K extends number, T = K>(
	...input: (ImmutableArray<T> | ImmutableSet<K & T> | Iterable<Entry<K, T>>)[]
): Iterable<Entry<K, T>>;
export function getEntries<K, T = K>(...input: (ImmutableSet<K & T> | Iterable<Entry<K, T>>)[]): Iterable<Entry<K, T>>;
export function* getEntries(
	...input: (ImmutableArray | ImmutableSet | ImmutableObject | ImmutableMap | Iterable<Entry>)[]
): Iterable<Entry> {
	for (const entries of input) {
		if (isArray(entries) || isSet(entries)) yield* entries.entries();
		else if (isIterable(entries)) yield* entries;
		else yield* Object.entries(entries);
	}
}
