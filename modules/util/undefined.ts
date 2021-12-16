import { RequiredError } from "..";

/** Is a value undefined? */
export const IS_UNDEFINED = (v: unknown): v is undefined => v === undefined;

/** Is a value defined? */
export const IS_DEFINED = <T>(v: T | undefined): v is T => v !== undefined;
export const NOT_UNDEFINED = IS_DEFINED;

/** Function that always returns undefined. */
export const GET_UNDEFINED = (): undefined => undefined;

/** Defined type is the type excluding `undefined` */
export type Defined<T> = Exclude<T, undefined>;

/** Get a required value (returns value or throws `RequiredError` if value is `undefined`). */
export function getDefined<T>(v: T): Defined<T>;
export function getDefined<T>(v: T | undefined): T;
export function getDefined<T>(v: T | undefined): T {
	if (v === undefined) throw new RequiredError("Value is undefined");
	return v;
}
