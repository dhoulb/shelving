import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/**
 * Function that always returns `null`.
 * - Useful as a default callback or placeholder.
 *
 * @returns `null`, always.
 * @see https://shelving.cc/util/null/getNull
 */
export function getNull(): null {
	return null;
}

/**
 * Nullable is the value or `null`.
 *
 * @see https://shelving.cc/util/null/Nullable
 */
export type Nullable<T> = T | null;

/**
 * Is a value `null`?
 *
 * @param value The value to test.
 * @returns `true` if `value` is `null`, otherwise `false`.
 * @see https://shelving.cc/util/null/isNull
 */
export function isNull(value: unknown): value is null {
	return value === null;
}

/**
 * Assert that a value is `null`.
 *
 * @param value The value to assert.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns Nothing; narrows `value` to `T`.
 * @throws `RequiredError` if `value` is not `null`.
 * @see https://shelving.cc/util/null/assertNull
 */
export function assertNull<T>(value: Nullable<T>, caller: AnyCaller = assertNull): asserts value is T {
	if (value !== null) throw new RequiredError("Must be null", { received: value, caller });
}

/**
 * Is a value not `null`?
 *
 * @param value The value to test.
 * @returns `true` if `value` is not `null`, otherwise `false`.
 * @see https://shelving.cc/util/null/notNull
 */
export function notNull<T>(value: Nullable<T>): value is T {
	return value !== null;
}

/**
 * Assert that a value is not `null`.
 *
 * @param value The value to assert.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns Nothing; narrows `value` to `T`.
 * @throws `RequiredError` if `value` is `null`.
 * @see https://shelving.cc/util/null/assertNotNull
 */
export function assertNotNull<T>(value: Nullable<T>, caller: AnyCaller = assertNotNull): asserts value is T {
	if (value === null) throw new RequiredError("Must not be null", { received: value, caller });
}

/**
 * Get the not-null version of a value, or throw `RequiredError` if it is `null`.
 *
 * @param value The value to require.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns The value, narrowed to `T`.
 * @throws RequiredError if `value` is `null`.
 * @see https://shelving.cc/util/null/requireNotNull
 */
export function requireNotNull<T>(value: Nullable<T>, caller: AnyCaller = requireNotNull): T {
	assertNotNull(value, caller);
	return value;
}

/**
 * Nullish is the value or `null` or `undefined`.
 *
 * @see https://shelving.cc/util/null/Nullish
 */
export type Nullish<T> = T | null | undefined;

/**
 * Is a value nullish (`null` or `undefined`)?
 *
 * @param value The value to test.
 * @returns `true` if `value` is `null` or `undefined`, otherwise `false`.
 * @see https://shelving.cc/util/null/isNullish
 */
export function isNullish<T>(value: Nullish<T>): value is null | undefined {
	return value === null || value === undefined;
}

/**
 * Assert that a value is nullish (`null` or `undefined`).
 *
 * @param value The value to assert.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns Nothing; narrows `value` to `T`.
 * @throws `RequiredError` if `value` is not `null` or `undefined`.
 * @see https://shelving.cc/util/null/assertNullish
 */
export function assertNullish<T>(value: Nullish<T>, caller: AnyCaller = assertNullish): asserts value is T {
	if (value !== null && value !== undefined) throw new RequiredError("Must be null or undefined", { received: value, caller });
}

/**
 * Is a value not nullish (not `null` and not `undefined`)?
 *
 * @param value The value to test.
 * @returns `true` if `value` is not `null` and not `undefined`, otherwise `false`.
 * @see https://shelving.cc/util/null/notNullish
 */
export function notNullish<T>(value: Nullish<T>): value is T {
	return value !== null && value !== undefined;
}

/**
 * Assert that a value is not nullish (not `null` and not `undefined`).
 *
 * @param value The value to assert.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns Nothing; narrows `value` to `T`.
 * @throws `RequiredError` if `value` is `null` or `undefined`.
 * @see https://shelving.cc/util/null/assertNotNullish
 */
export function assertNotNullish<T>(value: Nullish<T>, caller: AnyCaller = assertNotNullish): asserts value is T {
	if (value === null || value === undefined) throw new RequiredError("Must not be null or undefined", { received: value, caller });
}

/**
 * Get the not-nullish version of a value, or throw `RequiredError` if it is `null` or `undefined`.
 *
 * @param value The value to require.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns The value, narrowed to `T`.
 * @throws RequiredError if `value` is `null` or `undefined`.
 * @see https://shelving.cc/util/null/requireNotNullish
 */
export function requireNotNullish<T>(value: Nullish<T>, caller: AnyCaller = requireNotNullish): T {
	assertNotNullish(value, caller);
	return value;
}
