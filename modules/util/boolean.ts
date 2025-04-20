import { ValidationError } from "../error/request/InputError.js";

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
	if (typeof value !== "boolean") throw new ValidationError("Must be boolean", value);
}

/** Assert that a value is true. */
export function assertTrue(value: unknown): asserts value is true {
	if (value !== true) throw new ValidationError("Must be true", value);
}

/** Assert that a value is false. */
export function assertFalse(value: unknown): asserts value is false {
	if (value !== false) throw new ValidationError("Must be false", value);
}

/** Assert that a value is truthy. */
export function assertTruthy(value: unknown): asserts value is true {
	if (!value) throw new ValidationError("Must be truthy", value);
}

/** Assert that a value is falsy. */
export function assertFalsy(value: unknown): asserts value is false {
	if (value) throw new ValidationError("Must be falsy", value);
}
