import type { Entry } from "./entry.js";
import { limitItems } from "./iterate.js";

/**
 * `Map` with string keys that cannot be changed.
 * - Only allows keys to be `string`
 * - Consistent with `ImmutableArray` and `ImmutableObject`
 */
export type ImmutableMap<T = unknown> = ReadonlyMap<string, T>;

/**
 * `Map` with string keys that can be changed.
 * - Only allows keys to be `string`
 * - Consistent with `MutableArray` and `MutableObject`
 */
export type MutableMap<T = unknown> = Map<string, T>;

/** Is an unknown value a map? */
export const isMap = <T extends ImmutableMap>(v: T | unknown): v is T => v instanceof Map;

/** Apply a limit to a map. */
export function limitMap<T>(map: ImmutableMap<T>, limit: number): ImmutableMap<T> {
	return limit > map.size ? map : new Map(limitItems(map, limit));
}

/** Things that can be converted to arrays. */
export type PossibleMap<T> = ImmutableMap<T> | Iterable<Entry<T>>;

/** Convert an iterable to a `Map` (if it's already a `Map` it passes through unchanged). */
export function getMap<T>(iterable: ImmutableMap<T> | Iterable<Entry<T>>): ImmutableMap<T>; // Helps types flow through functions when `getMap` is used as an argument to a function.
export function getMap<T>(iterable: PossibleMap<T>): ImmutableMap<T>;
export function getMap<T>(iterable: PossibleMap<T>): ImmutableMap<T> {
	return iterable instanceof Map ? iterable : new Map(iterable);
}
