import { AssertionError } from "../error/AssertionError.js";
import { RequiredError } from "../error/RequiredError.js";
import { limitItems } from "./iterate.js";
import { getString } from "./string.js";

/** `Map` that cannot be changed. */
export type ImmutableMap<K = unknown, T = unknown> = ReadonlyMap<K, T>;

/** `Map` that can be changed. */
export type MutableMap<K = unknown, T = unknown> = Map<K, T>;

/** Extract the type for the value of an entry. */
export type MapKey<X> = X extends ReadonlyMap<infer Y, unknown> ? Y : never;

/** Extract the type for the value of an entry. */
export type MapValue<X> = X extends ReadonlyMap<unknown, infer Y> ? Y : never;

/** Things that can be converted to maps. */
export type PossibleMap<K, T> = ImmutableMap<K, T> | Iterable<readonly [K, T]>;

/** Is an unknown value a map? */
export const isMap = <T extends ImmutableMap>(v: T | unknown): v is T => v instanceof Map;

/** Assert that a value is a `Map` instance. */
export function assertMap<T extends ImmutableMap>(v: T | unknown): asserts v is T {
	if (!isMap(v)) throw new AssertionError(`Must be map`, v);
}

/** Convert an iterable to a `Map` (if it's already a `Map` it passes through unchanged). */
export function getMap<K, T>(iterable: PossibleMap<K, T>): ImmutableMap<K, T> {
	return isMap(iterable) ? iterable : new Map(iterable);
}

/** Apply a limit to a map. */
export function limitMap<T>(map: ImmutableMap<T>, limit: number): ImmutableMap<T> {
	return limit > map.size ? map : new Map(limitItems(map, limit));
}

/** Function that lets new items in a map be created and updated by calling a `reduce()` callback that receives the existing value. */
export function setMapItem<K, T>(map: MutableMap<K, T>, key: K, value: T): T {
	map.set(key, value);
	return value;
}

/** Map that changes `get()` to throw an error if the requested value doesn't exist. */
export class RequiredMap<K, T> extends Map<K, T> {
	override get(key: K): T {
		if (!this.has(key)) throw new RequiredError(`Item "${getString(key)}" is required`);
		return super.get(key) as T;
	}
}
