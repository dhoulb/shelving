import { isArray, mapArray, ReadonlyArray } from "./array";
import { EmptyObject, isObject, mapObject, ReadonlyObject } from "./object";

/** Cloneable object implement a `clone()` function that returns a cloned copy. */
export interface Cloneable {
	clone(): this;
}

/** Shallow clone a value. */
export const clone = <T>(value: T): T => value;

/** Deep clone a value. */
export function deepClone<T>(value: T, recursor = deepClone): T {
	if (isArray(value)) return cloneArray(value, recursor);
	if (isObject(value)) return cloneObject(value, recursor);
	return value;
}

/** Clone an array. */
export const cloneArray = <T extends ReadonlyArray>(arr: T, recursor = clone): T => mapArray(arr, recursor);

/** Clone an object. */
export const cloneObject = <T extends EmptyObject | ReadonlyObject>(obj: T, recursor = clone): T =>
	recursor === clone ? { __proto__: Object.getPrototypeOf(obj), ...obj } : mapObject(obj, recursor);
