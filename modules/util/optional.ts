import { RequiredError } from "../error/RequiredError.js";

/** Optional is the value or `null` or `undefined` (synonym for `Nullish`). */
export type Optional<T> = T | null | undefined | void;

/** Get a required value. */
export function getRequired<T>(value: Optional<T>): T {
	if (value === null || value === undefined) throw new RequiredError("Value is required");
	return value;
}

/** Is a value not optional? */
export const notOptional = <T>(value: Optional<T>): value is T => value !== null && value !== undefined;
