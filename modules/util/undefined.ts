import { AssertionError } from "../error/index.js";

/** Function that always returns undefined. */
export const getUndefined = (): undefined => undefined;

/** Is a value undefined? */
export const isUndefined = (v: unknown): v is undefined => v === undefined;

/** Is a value defined? */
export const isDefined = <T>(v: T | undefined): v is T => v !== undefined;

/** Assert that a value is not `undefined` */
export function assertDefined<T>(value: T | undefined): asserts value is T {
	if (value === undefined) throw new AssertionError("Must be defined", value);
}

/** Get a defined value. */
export function getDefined<T>(v: T | undefined): T {
	assertDefined(v);
	return v;
}
