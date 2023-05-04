import { AssertionError } from "../error/AssertionError.js";
import { RequiredError } from "../error/RequiredError.js";

/** Function that always returns null. */
export const getNull = (): null => null;

/** Is a value null? */
export const isNull = (value: unknown): value is null => value === null;

/** Is a value not null? */
export const notNull = <T>(value: T | null): value is T => value !== null;

/** Assert that a value is not null. */
export function assertNotNull<T>(value: T | null): asserts value is T {
	if (value === null) throw new AssertionError("Must not be null", value);
}

/** Get the not-nullish version of value. */
export function getNotNull<T>(value: T | null): T {
	assertNotNull(value);
	return value;
}

/** Nullish is `null` or `undefined` */
export type Nullish<T> = T | null | undefined;

/** Is a value nullish? */
export const isNullish = <T>(value: Nullish<T>): value is null | undefined => value === null || value === undefined;

/** Is a value not nullish? */
export const notNullish = <T>(value: Nullish<T>): value is T => value !== null && value !== undefined;

/** Assert that a value is not nullish. */
export function assertNotNullish<T>(value: Nullish<T>): asserts value is T {
	if (value === null || value === undefined) throw new AssertionError("Must not be null or undefined", value);
}

/** Get the not-nullish version of value. */
export function getNotNullish<T>(value: Nullish<T>): T {
	assertNotNullish(value);
	return value;
}

/** Get a required value. */
export function getRequired<T>(value: Nullish<T>): T {
	if (isNullish(value)) throw new RequiredError("Value is required");
	return value;
}
