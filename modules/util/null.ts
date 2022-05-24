import { AssertionError } from "../error/AssertionError.js";

/** Function that always returns null. */
export const getNull = (): null => null;

/** Is a value null? */
export const isNull = (v: unknown): v is null => v === null;

/** Is a value not null? */
export const notNull = <T>(v: T | null): v is T => v !== null;

/** Assert that a value is not null. */
export function assertNotNull<T>(v: T | null): asserts v is T {
	if (v === null) throw new AssertionError("Must not be null", v);
}

/** Get the not-nullish version of value. */
export function getNotNull<T>(v: T | null): T {
	assertNotNull(v);
	return v;
}

/** Nullish is `null` or `undefined` */
export type Nullish<T> = T | null | undefined;

/** Is a value nullish? */
export const isNullish = <T>(v: Nullish<T>): v is null | undefined => v === null || v === undefined;

/** Is a value not nullish? */
export const notNullish = <T>(v: Nullish<T>): v is T => v !== null && v !== undefined;

/** Assert that a value is not nullish. */
export function assertNotNullish<T>(v: Nullish<T>): asserts v is T {
	if (v === null || v === undefined) throw new AssertionError("Must not be null or undefined", v);
}

/** Get the not-nullish version of value. */
export function getNotNullish<T>(v: Nullish<T>): T {
	assertNotNullish(v);
	return v;
}
