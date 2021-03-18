import { isArray, ImmutableArray, mapArray } from "../array";
import { EmptyObject, isObject, ImmutableObject, mapObject } from "../object";

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
export const cloneArray = <T extends ImmutableArray>(arr: T, recursor = clone): T => {
	const output = mapArray(arr, recursor);
	Object.setPrototypeOf(arr, Object.getPrototypeOf(arr));
	return output;
};

/** Clone an object. */
export const cloneObject = <T extends EmptyObject | ImmutableObject>(obj: T, recursor = clone): T => {
	const output = mapObject<T, T>(obj, recursor);
	Object.setPrototypeOf(obj, Object.getPrototypeOf(obj));
	return output;
};
