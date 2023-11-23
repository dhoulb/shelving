import type { ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import type { ImmutableObject } from "./object.js";
import type { ImmutableSet } from "./set.js";
import { isArray } from "./array.js";
import { isIterable } from "./iterate.js";
import { isSet } from "./set.js";

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

/** Convert an entry back into an object. */
export type EntryObject<T extends Entry<PropertyKey, unknown>> = { readonly [E in T as E[0]]: E[1] };

/** Extract the key from an object entry. */
export function getEntryKey<K, T>([k]: Entry<K, T>): K {
	return k;
}

/** Extract the value from an object entry. */
export function getEntryValue<K, T>([, v]: Entry<K, T>): T {
	return v;
}

/** Yield the keys of an iterable set of entries. */
export function* getEntryKeys<K, T>(input: Iterable<Entry<K, T>>): Iterable<K> {
	for (const [k] of input) yield k;
}

/** Yield the values of an iterable set of entries. */
export function* getEntryValues<K, T>(input: Iterable<Entry<K, T>>): Iterable<T> {
	for (const [, v] of input) yield v;
}

/** Yield the entries in something that can yield entries. */
export function getEntries<K extends string, T = K>(...input: (ImmutableSet<K & T> | Partial<ImmutableObject<K, T>> | Iterable<Entry<K, T>>)[]): Iterable<Entry<K, T>>;
export function getEntries<K extends number, T = K>(...input: (ImmutableArray<T> | ImmutableSet<K & T> | Iterable<Entry<K, T>>)[]): Iterable<Entry<K, T>>;
export function getEntries<K, T = K>(...input: (ImmutableSet<K & T> | Iterable<Entry<K, T>>)[]): Iterable<Entry<K, T>>;
export function* getEntries(...input: (ImmutableArray | ImmutableSet | ImmutableObject | ImmutableMap | Iterable<Entry>)[]): Iterable<Entry> {
	for (const entries of input) {
		if (isArray(entries) || isSet(entries)) yield* entries.entries();
		else if (isIterable(entries)) yield* entries;
		else yield* Object.entries(entries);
	}
}
