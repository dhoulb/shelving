import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/** Optional is the value or `null` or `undefined` (synonym for `Nullish`). */
export type Optional<T> = T | null | undefined;

/** Get a required value. */
export function getRequired<T>(value: Optional<T>, caller: AnyCaller = getRequired): T {
	if (value === null || value === undefined) throw new RequiredError("Value is required", { received: value, caller });
	return value;
}

/** Is a value not optional? */
export function notOptional<T>(value: Optional<T>): value is T {
	return value !== null && value !== undefined;
}
