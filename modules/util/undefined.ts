import { ValueError } from "../error/ValueError.js";

/** Function that always returns undefined. */
export const getUndefined = (): undefined => undefined;

/** Is a value undefined? */
export const isUndefined = (value: unknown): value is undefined | void => value === undefined;

/** Is a value defined? */
export const isDefined = <T>(value: T | undefined | void): value is T => value !== undefined;

/** Is a value defined? */
export const notUndefined = isDefined;

/** Assert that a value is not `undefined` */
export function assertDefined<T>(value: T | undefined | void): asserts value is T {
	if (value === undefined) throw new ValueError("Must be defined", value);
}

/** Get a defined value. */
export function getDefined<T>(value: T | undefined | void): T {
	assertDefined(value);
	return value;
}
