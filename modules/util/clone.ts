import { ImmutableArray, isArray } from "./array.js";
import { isData } from "./data.js";
import { mapArray, mapObject } from "./transform.js";
import { ImmutableObject } from "./object.js";

/** Cloneable object implement a `clone()` function that returns a cloned copy. */
export interface Cloneable {
	clone(): this;
}

/** Does an object implement `Cloneable` */
export const isCloneable = <T extends Cloneable>(v: T | unknown): v is T => isData(v) && typeof v.cloneable === "function";

/** Shallow clone a value. */
export const shallowClone = <T>(value: T): T => value;

/** Deep clone a value. */
export function deepClone<T>(value: T, recursor = deepClone): T {
	if (isCloneable(value)) return value.clone();
	if (isArray(value)) return cloneArray(value, recursor);
	if (isData(value)) return cloneObject(value, recursor);
	return value;
}

/** Clone an array. */
export function cloneArray<T extends ImmutableArray>(input: T, recursor = shallowClone): T {
	if (isCloneable(input)) return input.clone();
	const output = mapArray(input, recursor);
	Object.setPrototypeOf(output, Object.getPrototypeOf(input));
	return output;
}

/** Clone an object. */
export function cloneObject<T extends ImmutableObject>(input: T, recursor = shallowClone): T {
	if (isCloneable(input)) return input.clone();
	const output = mapObject(input, recursor);
	Object.setPrototypeOf(input, Object.getPrototypeOf(input));
	return output;
}
