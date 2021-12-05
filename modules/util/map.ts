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

/** Convert an iterable to a `Map` (if it's already a `Map` it passes through unchanged). */
export function toMap<T>(iterable: MutableMap<T> | Iterable<Entry<T>>): MutableMap<T>; // Mutable returns mutable.
export function toMap<T>(iterable: ImmutableMap<T> | Iterable<Entry<T>>): ImmutableMap<T>; // Immutable returns immutable.
export function toMap<T>(iterable: ImmutableMap<T> | Iterable<Entry<T>>): ImmutableMap<T> {
	return iterable instanceof Map ? iterable : new Map(iterable);
}
