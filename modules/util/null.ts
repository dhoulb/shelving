import type { AnyCaller } from "../error/BaseError.js";
import { RequiredError } from "../error/RequiredError.js";

/** Function that always returns null. */
export function getNull(): null {
	return null;
}

/** Nullable is the value or `null` */
export type Nullable<T> = T | null;

/** Is a value null? */
export function isNull(value: unknown): value is null {
	return value === null;
}

/** Assert that a value is not null. */
export function assertNull<T>(value: Nullable<T>, caller: AnyCaller = assertNull): asserts value is T {
	if (value !== null) throw new RequiredError("Must be null", { received: value, caller });
}

/** Is a value not null? */
export function notNull<T>(value: Nullable<T>): value is T {
	return value !== null;
}

/** Assert that a value is not null. */
export function assertNotNull<T>(value: Nullable<T>, caller: AnyCaller = assertNotNull): asserts value is T {
	if (value === null) throw new RequiredError("Must not be null", { received: value, caller });
}

/** Get the not-nullish version of value. */
export function requireNotNull<T>(value: Nullable<T>, caller: AnyCaller = requireNotNull): T {
	assertNotNull(value, caller);
	return value;
}

/** Nullish is the value or `null` or `undefined` */
export type Nullish<T> = T | null | undefined;

/** Is a value nullish? */
export function isNullish<T>(value: Nullish<T>): value is null | undefined {
	return value === null || value === undefined;
}

/** Assert that a value is not nullish. */
export function assertNullish<T>(value: Nullish<T>, caller: AnyCaller = assertNullish): asserts value is T {
	if (value !== null && value !== undefined) throw new RequiredError("Must be null or undefined", { received: value, caller });
}

/** Is a value not nullish? */
export function notNullish<T>(value: Nullish<T>): value is T {
	return value !== null && value !== undefined;
}

/** Assert that a value is not nullish. */
export function assertNotNullish<T>(value: Nullish<T>, caller: AnyCaller = assertNotNullish): asserts value is T {
	if (value === null || value === undefined) throw new RequiredError("Must not be null or undefined", { received: value, caller });
}

/** Get the not-nullish version of value. */
export function requireNotNullish<T>(value: Nullish<T>, caller: AnyCaller = requireNotNullish): T {
	assertNotNullish(value, caller);
	return value;
}
