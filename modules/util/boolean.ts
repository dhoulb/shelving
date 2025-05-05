import type { AnyCaller } from "../error/BaseError.js";
import { RequiredError } from "../error/RequiredError.js";

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
export function assertBoolean(value: unknown, caller: AnyCaller = assertBoolean): asserts value is boolean {
	if (typeof value !== "boolean") throw new RequiredError("Must be boolean", { received: value, caller });
}

/** Assert that a value is true. */
export function assertTrue(value: unknown, caller: AnyCaller = assertTrue): asserts value is true {
	if (value !== true) throw new RequiredError("Must be true", { received: value, caller });
}

/** Assert that a value is false. */
export function assertFalse(value: unknown, caller: AnyCaller = assertFalse): asserts value is false {
	if (value !== false) throw new RequiredError("Must be false", { received: value, caller });
}

/** Assert that a value is truthy. */
export function assertTruthy(value: unknown, caller: AnyCaller = assertTruthy): asserts value is true {
	if (!value) throw new RequiredError("Must be truthy", { received: value, caller });
}

/** Assert that a value is falsy. */
export function assertFalsy(value: unknown, caller: AnyCaller = assertFalsy): asserts value is false {
	if (value) throw new RequiredError("Must be falsy", { received: value, caller });
}
