import type { Data } from "./data.js";

/**
 * Single entry from a map-like object.
 * - Consistency with `UnknownObject`
 * - Always readonly.
 */
export type Entry<T = unknown> = readonly [string, T];

/** Extract the type for an entry. */
export type EntryType<X> = X extends Entry<infer Y> ? Y : never;

/** Extract the key from an object entry. */
export const getEntryKey = ([k]: Entry): string => k;

/** Extract the value from an object entry. */
export const getEntryValue = <T>([, v]: Entry<T>): T => v;

/**
 * Extract the value of a named prop from an object.
 * - Extraction is possibly deep if deeper keys are specified.
 *
 * @param obj The target object to get from.
 * @param k1 The key of the prop in the object to get.
 * @param k2 The sub-key of the prop in the object to get.
 * @param k3 The sub-sub-key of the prop in the object to get.
 * @param k4 The sub-sub-sub-key of the prop in the object to get.
 */
export function getEntryProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(entry: Entry<T>, k1: K1, k2: K2, k3: K3, k4: K4): T[K1][K2][K3][K4];
export function getEntryProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(entry: Entry<T>, k1: K1, k2: K2, k3: K3): T[K1][K2][K3];
export function getEntryProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1]>(entry: Entry<T>, k1: K1, k2: K2): T[K1][K2];
export function getEntryProp<T extends Data, K1 extends keyof T>(entry: Entry<T>, k1: K1): T[K1];
export function getEntryProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
	[, v]: Entry<T>,
	k1: K1,
	k2?: K2,
	k3?: K3,
	k4?: K4,
): T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4] {
	return !k2 ? v[k1] : !k3 ? v[k1][k2] : !k4 ? v[k1][k2][k3] : v[k1][k2][k3][k4];
}

/** Yield the keys of an iterable set of entries. */
export function* getEntryKeys(input: Iterable<Entry>): Iterable<string> {
	for (const [k] of input) yield k;
}

/** Yield the values of an iterable set of entries. */
export function* getEntryValues<T>(input: Iterable<Entry<T>>): Iterable<T> {
	for (const [, v] of input) yield v;
}

/* Yield a named prop of an iterable set of object entries. */
export function getEntryProps<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(entries: Iterable<Entry<T>>, k1: K1, k2: K2, k3: K3, k4: K4): Iterable<T[K1][K2][K3][K4]>; // prettier-ignore
export function getEntryProps<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(entries: Iterable<Entry<T>>, k1: K1, k2: K2, k3: K3): Iterable<T[K1][K2][K3]>;
export function getEntryProps<T extends Data, K1 extends keyof T, K2 extends keyof T[K1]>(entries: Iterable<Entry<T>>, k1: K1, k2: K2): Iterable<T[K1][K2]>;
export function getEntryProps<T extends Data, K1 extends keyof T>(entries: Iterable<Entry<T>>, k1: K1): Iterable<T[K1]>;
export function* getEntryProps<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
	entries: Iterable<Entry<T>>,
	k1: K1,
	k2?: K2,
	k3?: K3,
	k4?: K4,
): Iterable<T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4]> {
	for (const [, v] of entries) yield !k2 ? v[k1] : !k3 ? v[k1][k2] : !k4 ? v[k1][k2][k3] : v[k1][k2][k3][k4];
}
