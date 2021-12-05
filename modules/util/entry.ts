import type { ImmutableArray, MutableArray } from "./array.js";
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

/** Readonly list of entries with string keys. */
export type ImmutableEntries<T = unknown> = ImmutableArray<Entry<T>>;

/** Writable object with string keys. */
export type MutableEntries<T = unknown> = MutableArray<Entry<T>>;

/** Extract the key from an object entry. */
export const ENTRY_KEY = ([k]: Entry): string => k;

/** Extract the value from an object entry. */
export const ENTRY_VALUE = <T>([, v]: Entry<T>): T => v;

/** Extract an optional `date` property from an object entry. */
export const ENTRY_DATE = <T extends PossibleOptionalDate>([, { date }]: Entry<{ date: T }>): T => date;

/** Extract a numeric `order` property from an object entry. */
export const ENTRY_ORDER = ([, { order }]: Entry<{ order: number }>): number => order;

/** Extract a string `title` property from an object entry. */
export const ENTRY_TITLE = ([, { title }]: Entry<{ title: string }>): string => title;

/** Extract a string `name` property from an object entry. */
export const ENTRY_NAME = ([, { name }]: Entry<{ name: string }>): string => name;
