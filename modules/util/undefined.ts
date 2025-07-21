import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/** Function that always returns undefined. */
export function getUndefined(): undefined {
	return undefined;
}

/** Is a value undefined? */
export function isUndefined(value: unknown): value is undefined {
	return value === undefined;
}

/** Is a value defined? */
export function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined;
}

/** Is a value defined? */
export const notUndefined = isDefined;

/** Assert that a value is not `undefined` */
export function assertDefined<T>(value: T | undefined, caller: AnyCaller = assertDefined): asserts value is T {
	if (value === undefined) throw new RequiredError("Must be defined", { received: value, caller });
}

/** Get a defined value. */
export function requireDefined<T>(value: T | undefined, caller: AnyCaller = requireDefined): T {
	assertDefined(value, caller);
	return value;
}
