import { AssertionError } from "../error/AssertionError.js";

/** Is a value a boolean? */
export function isBoolean(value: unknown): value is boolean {
	return typeof value === "boolean";
}

/** Is a value true? */
export function isTrue(value: unknown): value is true {
	return value === true;
}

/** Is a value false? */
export function isFalse(value: unknown): value is false {
	return value === false;
}

/** Is a value truthy? */
export function isTruthy(value: unknown): boolean {
	return !!value;
}

/** Is a value falsey? */
export function isFalsey(value: unknown): boolean {
	return !value;
}

/** Assert that a value is a boolean. */
export function assertBoolean(value: unknown): asserts value is boolean {
	if (typeof value !== "boolean") throw new AssertionError("Must be boolean", { received: value, caller: assertBoolean });
}

/** Assert that a value is true. */
export function assertTrue(value: unknown): asserts value is true {
	if (value !== true) throw new AssertionError("Must be true", { received: value, caller: assertTrue });
}

/** Assert that a value is false. */
export function assertFalse(value: unknown): asserts value is false {
	if (value !== false) throw new AssertionError("Must be false", { received: value, caller: assertFalse });
}

/** Assert that a value is truthy. */
export function assertTruthy(value: unknown): asserts value is true {
	if (!value) throw new AssertionError("Must be truthy", { received: value, caller: assertTruthy });
}

/** Assert that a value is falsy. */
export function assertFalsy(value: unknown): asserts value is false {
	if (value) throw new AssertionError("Must be falsy", { received: value, caller: assertFalsy });
}
