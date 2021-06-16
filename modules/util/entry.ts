import type { SKIP } from "./constants";

/**
 * Single entry.
 * - Consistency with `UnknownObject`
 * - Always readonly.
 */
export type Entry<T = unknown> = readonly [string, T];

/**
 * Unknown entry.
 * - Consistency with `UnknownObject`
 */
export type UnknownEntry = Entry<unknown>;

/**
 * Entry type: extract the type for an entry.
 * - Consistency with builtin `ReturnType<T>` and our `ObjectType<T>` and `SchemaType<T>`
 */
export type EntryType<T extends UnknownEntry> = T extends Entry<infer X> ? X : never;

/**
 * Mutable entries: an array of entries that can be changed.
 * - Consistency with `MutableObject<T>`
 */
export type MutableEntries<T = unknown> = Entry<T>[];

/**
 * Immutable entries: an array of entries that cannot be changed.
 * - Consistency with `ImmutableObject<T>`
 */
export type ImmutableEntries<T = unknown> = readonly Entry<T>[];

/**
 * Resolvable entries: an array of entries whose properties can be resolved with `resolveArray()`
 * - Values can be `SKIP` symbol (and they will be removed).
 * - Values can be `Promise` instances (and they will be awaited).
 */
export type ResolvableEntries<T> = readonly Entry<typeof SKIP | T | Promise<typeof SKIP | T>>[];

/**
 * Entry type: extract the type for a set of entries.
 * - Consistency with builtin `ReturnType<T>` and `ObjectType<T>` and `SchemaType<T>`
 */
export type EntriesType<T extends ImmutableEntries> = T extends ImmutableEntries<infer X> ? X : never;

/** Extract the key from an object entry. */
export const getEntryKey = (entry: Entry<unknown>): string => entry[0];

/** Extract the value from an object entry. */
export const getEntryValue = <V>(entry: Entry<V>): V => entry[1];

/** Extract a date property from an object entry. */
export const getEntryDate = <V extends { date?: unknown }>(entry: Entry<V>): V["date"] => entry[1].date;

/** Extract an order property from an object entry. */
export const getEntryOrder = <V extends { order?: unknown }>(entry: Entry<V>): V["order"] => entry[1].order;

/** Extract a title property from an object entry. */
export const getEntryTitle = <V extends { title?: unknown }>(entry: Entry<V>): V["title"] => entry[1].title;

/** Extract a name property from an object entry. */
export const getEntryName = <V extends { name?: unknown }>(entry: Entry<V>): V["name"] => entry[1].name;
