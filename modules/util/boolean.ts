import { AssertionError } from "../error/index.js";

/** Is a value a boolean? */
export const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

/** Is a value true? */
export const isTrue = (v: unknown): v is true => v === true;

/** Is a value false? */
export const isFalse = (v: unknown): v is false => v === false;

/** Is a value truthy? */
export const isTruthy = (v: unknown): boolean => !!v;

/** Is a value falsey? */
export const isFalsey = (v: unknown): boolean => !v;

/** Assert that a value is a boolean. */
export function assertBoolean(v: unknown): asserts v is boolean {
	if (typeof v !== "boolean") throw new AssertionError(`Must be boolean`, v);
}

/** Assert that a value is true. */
export function assertTrue(v: unknown): asserts v is true {
	if (v !== true) throw new AssertionError(`Must be true`, v);
}

/** Assert that a value is false. */
export function assertFalse(v: unknown): asserts v is false {
	if (v !== false) throw new AssertionError(`Must be false`, v);
}

/** Assert that a value is truthy. */
export function assertTruthy(v: unknown): asserts v is true {
	if (!v) throw new AssertionError(`Must be truthy`, v);
}

/** Assert that a value is falsy. */
export function assertFalsy(v: unknown): asserts v is false {
	if (v) throw new AssertionError(`Must be falsy`, v);
}
