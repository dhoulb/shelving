import type { Data } from "./data.js";
import type { PossibleOptionalDate } from "./date.js";

/**
 * Single entry from a map-like object.
 * - Consistency with `UnknownObject`
 * - Always readonly.
 */
export type Entry<T = unknown> = readonly [string, T];

/** Any ebtry (useful for `extends AnyEntry` clauses). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEntry = readonly [string, any];

/** Extract the type for an entry. */
export type EntryType<X extends AnyEntry> = X extends Entry<infer Y> ? Y : never;

/** Iterable set of entries containing keys and values.. */
export type Entries<T = unknown> = Iterable<Entry<T>>;

/** Extract the key from an object entry. */
export const getKey = ([k]: Entry): string => k;

/** Extract the value from an object entry. */
export const getValue = <T>([, v]: Entry<T>): T => v;

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
export function getValueProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(entry: Entry<T>, k1: K1, k2: K2, k3: K3, k4: K4): T[K1][K2][K3][K4];
export function getValueProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(entry: Entry<T>, k1: K1, k2: K2, k3: K3): T[K1][K2][K3];
export function getValueProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1]>(entry: Entry<T>, k1: K1, k2: K2): T[K1][K2];
export function getValueProp<T extends Data, K1 extends keyof T>(entry: Entry<T>, k1: K1): T[K1];
export function getValueProp<T extends Data, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(
	[, entry]: Entry<T>,
	k1: K1,
	k2?: K2,
	k3?: K3,
	k4?: K4,
): T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4] {
	return !k2 ? entry[k1] : !k3 ? entry[k1][k2] : !k4 ? entry[k1][k2][k3] : entry[k1][k2][k3][k4];
}

/** Extract an optional `date` property from an object entry. */
export const getValueDateProp = <T extends PossibleOptionalDate>([, { date }]: Entry<{ date: T }>): T => date;

/** Extract a numeric `order` property from an object entry. */
export const getValueOrder = ([, { order }]: Entry<{ order: number }>): number => order;

/** Extract a string `title` property from an object entry. */
export const getValueTitle = ([, { title }]: Entry<{ title: string }>): string => title;

/** Extract a string `name` property from an object entry. */
export const getValueName = ([, { name }]: Entry<{ name: string }>): string => name;
