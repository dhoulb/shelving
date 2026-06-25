import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/**
 * Function that always returns `undefined`.
 *
 * - Useful as a no-op callback or default factory that yields `undefined`.
 *
 * @returns Always `undefined`.
 * @see https://shelving.cc/util/undefined/getUndefined
 */
export function getUndefined(): undefined {
	return undefined;
}

/**
 * Is a value `undefined`?
 *
 * @param value The value to test.
 * @returns `true` if the value is `undefined`, otherwise `false`.
 * @see https://shelving.cc/util/undefined/isUndefined
 */
export function isUndefined(value: unknown): value is undefined {
	return value === undefined;
}

/**
 * Is a value defined (i.e. not `undefined`)?
 *
 * @param value The value to test.
 * @returns `true` if the value is not `undefined`, otherwise `false`.
 * @see https://shelving.cc/util/undefined/isDefined
 */
export function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined;
}

/**
 * Is a value defined (i.e. not `undefined`)? Alias for `isDefined()`.
 *
 * @see https://shelving.cc/util/undefined/notUndefined
 */
export const notUndefined = isDefined;

/**
 * Assert that a value is not `undefined`.
 *
 * @param value The value to assert is defined.
 * @param caller Function to attribute the thrown error to (defaults to `assertDefined`).
 * @throws `RequiredError` if the value is `undefined`.
 * @see https://shelving.cc/util/undefined/assertDefined
 */
export function assertDefined<T>(value: T | undefined, caller: AnyCaller = assertDefined): asserts value is T {
	if (value === undefined) throw new RequiredError("Must be defined", { received: value, caller });
}

/**
 * Get a defined value, or throw if it is `undefined`.
 *
 * @param value The value to require.
 * @param caller Function to attribute the thrown error to (defaults to `requireDefined`).
 * @returns The value, guaranteed not to be `undefined`.
 * @throws `RequiredError` if the value is `undefined`.
 * @see https://shelving.cc/util/undefined/requireDefined
 */
export function requireDefined<T>(value: T | undefined, caller: AnyCaller = requireDefined): T {
	assertDefined(value, caller);
	return value;
}
