import { RequiredError } from "../error/index.js";

/** Is a value null? */
export const isNull = (v: unknown): v is null => v === null;

/** Is a value not null? */
export const notNull = <T>(v: T | null): v is T => v !== null;

/** Function that always returns null. */
export const NULL = (): null => null;

/** Nullish is `null` or `undefined` */
export type Nullish<T> = T | null | undefined;

/** not nullish is not `null` or `undefined` */
export type NotNullish<T> = Exclude<T, null | undefined>;

/** Is a value nullish? */
export const isNullish = <T>(v: Nullish<T>): v is null | undefined => v === null || v === undefined;

/** Is a value not nullish? */
export const notNullish = <T>(v: Nullish<T>): v is T => v !== null && v !== undefined;

/** Get a required value (returns value or throws `RequiredError` if value is `null` or `undefined`). */
export function getRequired<T>(v: T): NotNullish<T>;
export function getRequired<T>(v: Nullish<T>): T;
export function getRequired<T>(v: Nullish<T>): T {
	if (v === undefined || v === null) throw new RequiredError("Required value is missing");
	return v;
}
