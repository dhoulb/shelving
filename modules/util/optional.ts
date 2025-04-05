import { NotFoundError } from "../error/NotFoundError.js";

/** Optional is the value or `null` or `undefined` (synonym for `Nullish`). */
export type Optional<T> = T | null | undefined;

/** Get a required value. */
export function getRequired<T>(value: Optional<T>): T {
	if (value === null || value === undefined) throw new NotFoundError();
	return value;
}

/** Is a value not optional? */
export function notOptional<T>(value: Optional<T>): value is T {
	return value !== null && value !== undefined;
}
