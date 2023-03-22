import { AssertionError } from "../error/AssertionError.js";

/** Function that always returns undefined. */
export const getUndefined = (): undefined => undefined;

/** Is a value undefined? */
export const isUndefined = (value: unknown): value is undefined => value === undefined;

/** Is a value defined? */
export const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

/** Assert that a value is not `undefined` */
export function assertDefined<T>(value: T | undefined): asserts value is T {
	if (value === undefined) throw new AssertionError("Must be defined", value);
}

/** Get a defined value. */
export function getDefined<T>(value: T | undefined): T {
	assertDefined(value);
	return value;
}
