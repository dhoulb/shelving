import { AssertionError } from "../error/AssertionError.js";

/** Function that always returns null. */
export const getNull = (): null => null;

/** Nullable is the value or `null` */
export type Nullable<T> = T | null;

/** Is a value null? */
export const isNull = (value: unknown): value is null => value === null;

/** Assert that a value is not null. */
export function assertNull<T>(value: Nullable<T>): asserts value is T {
	if (value !== null) throw new AssertionError("Must be null", value);
}

/** Is a value not null? */
export const notNull = <T>(value: Nullable<T>): value is T => value !== null;

/** Assert that a value is not null. */
export function assertNotNull<T>(value: Nullable<T>): asserts value is T {
	if (value === null) throw new AssertionError("Must not be null", value);
}

/** Get the not-nullish version of value. */
export function getNotNull<T>(value: Nullable<T>): T {
	assertNotNull(value);
	return value;
}

/** Nullish is the value or `null` or `undefined` */
export type Nullish<T> = T | null | undefined | void;

/** Is a value nullish? */
export const isNullish = <T>(value: Nullish<T>): value is null | undefined | void => value === null || value === undefined;

/** Assert that a value is not nullish. */
export function assertNullish<T>(value: Nullish<T>): asserts value is T {
	if (value !== null && value !== undefined) throw new AssertionError("Must be null or undefined", value);
}

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
