import { AssertionError } from "../error/AssertionError.js";

/** Is a value a boolean? */
export const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

/** Is a value true? */
export const isTrue = (value: unknown): value is true => value === true;

/** Is a value false? */
export const isFalse = (value: unknown): value is false => value === false;

/** Is a value truthy? */
export const isTruthy = (value: unknown): boolean => !!value;

/** Is a value falsey? */
export const isFalsey = (value: unknown): boolean => !value;

/** Assert that a value is a boolean. */
export function assertBoolean(value: unknown): asserts value is boolean {
	if (typeof value !== "boolean") throw new AssertionError(`Must be boolean`, value);
}

/** Assert that a value is true. */
export function assertTrue(value: unknown): asserts value is true {
	if (value !== true) throw new AssertionError(`Must be true`, value);
}

/** Assert that a value is false. */
export function assertFalse(value: unknown): asserts value is false {
	if (value !== false) throw new AssertionError(`Must be false`, value);
}

/** Assert that a value is truthy. */
export function assertTruthy(value: unknown): asserts value is true {
	if (!value) throw new AssertionError(`Must be truthy`, value);
}

/** Assert that a value is falsy. */
export function assertFalsy(value: unknown): asserts value is false {
	if (value) throw new AssertionError(`Must be falsy`, value);
}
