import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/**
 * Is an unknown value a boolean?
 *
 * @param value The value to test.
 * @returns `true` if `value` is a `boolean`, narrowing its type.
 * @see https://shelving.cc/util/boolean/isBoolean
 */
export function isBoolean(value: unknown): value is boolean {
	return typeof value === "boolean";
}

/**
 * Is an unknown value exactly `true`?
 *
 * @param value The value to test.
 * @returns `true` if `value` is the literal `true`, narrowing its type.
 * @see https://shelving.cc/util/boolean/isTrue
 */
export function isTrue(value: unknown): value is true {
	return value === true;
}

/**
 * Is an unknown value exactly `false`?
 *
 * @param value The value to test.
 * @returns `true` if `value` is the literal `false`, narrowing its type.
 * @see https://shelving.cc/util/boolean/isFalse
 */
export function isFalse(value: unknown): value is false {
	return value === false;
}

/**
 * Is an unknown value truthy?
 *
 * @param value The value to test.
 * @returns `true` if `value` coerces to `true`.
 * @see https://shelving.cc/util/boolean/isTruthy
 */
export function isTruthy(value: unknown): boolean {
	return !!value;
}

/**
 * Is an unknown value falsey?
 *
 * @param value The value to test.
 * @returns `true` if `value` coerces to `false`.
 * @see https://shelving.cc/util/boolean/isFalsey
 */
export function isFalsey(value: unknown): boolean {
	return !value;
}

/**
 * Assert that an unknown value is a boolean.
 *
 * @param value The value to assert.
 * @param caller Function to attribute a thrown error to (defaults to `assertBoolean` itself).
 * @throws {RequiredError} If `value` is not a `boolean`.
 * @see https://shelving.cc/util/boolean/assertBoolean
 */
export function assertBoolean(value: unknown, caller: AnyCaller = assertBoolean): asserts value is boolean {
	if (typeof value !== "boolean") throw new RequiredError("Must be boolean", { received: value, caller });
}

/**
 * Assert that an unknown value is exactly `true`.
 *
 * @param value The value to assert.
 * @param caller Function to attribute a thrown error to (defaults to `assertTrue` itself).
 * @throws {RequiredError} If `value` is not the literal `true`.
 * @see https://shelving.cc/util/boolean/assertTrue
 */
export function assertTrue(value: unknown, caller: AnyCaller = assertTrue): asserts value is true {
	if (value !== true) throw new RequiredError("Must be true", { received: value, caller });
}

/**
 * Assert that an unknown value is exactly `false`.
 *
 * @param value The value to assert.
 * @param caller Function to attribute a thrown error to (defaults to `assertFalse` itself).
 * @throws {RequiredError} If `value` is not the literal `false`.
 * @see https://shelving.cc/util/boolean/assertFalse
 */
export function assertFalse(value: unknown, caller: AnyCaller = assertFalse): asserts value is false {
	if (value !== false) throw new RequiredError("Must be false", { received: value, caller });
}

/**
 * Assert that an unknown value is truthy.
 *
 * @param value The value to assert.
 * @param caller Function to attribute a thrown error to (defaults to `assertTruthy` itself).
 * @throws {RequiredError} If `value` is falsey.
 * @see https://shelving.cc/util/boolean/assertTruthy
 */
export function assertTruthy(value: unknown, caller: AnyCaller = assertTruthy): asserts value is true {
	if (!value) throw new RequiredError("Must be truthy", { received: value, caller });
}

/**
 * Assert that an unknown value is falsy.
 *
 * @param value The value to assert.
 * @param caller Function to attribute a thrown error to (defaults to `assertFalsy` itself).
 * @throws {RequiredError} If `value` is truthy.
 * @see https://shelving.cc/util/boolean/assertFalsy
 */
export function assertFalsy(value: unknown, caller: AnyCaller = assertFalsy): asserts value is false {
	if (value) throw new RequiredError("Must be falsy", { received: value, caller });
}
