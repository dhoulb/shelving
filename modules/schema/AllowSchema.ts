import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { getString } from "../util/string.js";
import { isArray, isItem } from "../util/array.js";
import { getOptionalNumber } from "../util/number.js";
import { isEntry } from "../util/object.js";
import { Schema } from "./Schema.js";

/** Specify a specific list of allowed values. */
export type Allowed<T extends string | number> = ReadonlyArray<T> | { readonly [K in T]: unknown };

/** Validate a value against a specific set of allowed values. */
export function validateAllowed<T extends string | number>(value: unknown, allowed: Allowed<T>): T {
	if (isArray(allowed)) {
		if (isItem(allowed, value)) return value;
	} else {
		if (isEntry(allowed, value)) return value;
	}
	throw new InvalidFeedback("Unknown value", { value });
}

/** Define a valid value from an allowed set of values. */
export abstract class AllowSchema<T extends string | number> extends Schema<T> {
	readonly allow: Allowed<T>;
	readonly value: T | null;
	constructor({
		allow,
		value = null,
		...options
	}: ConstructorParameters<typeof Schema>[0] & {
		allow: Allowed<T>;
		value?: T | null;
	}) {
		super(options);
		this.allow = allow;
		this.value = value;
	}
}

/** Define a valid string from an allowed set of strings. */
export class AllowStringSchema<T extends string> extends AllowSchema<T> {
	validate(unsafeValue: unknown = this.value): T {
		return validateAllowed(getString(unsafeValue), this.allow);
	}
}

/** Define a valid number from an allowed set of numbers. */
export class AllowNumberSchema<T extends number> extends AllowSchema<T> {
	validate(unsafeValue: unknown = this.value): T {
		return validateAllowed(getOptionalNumber(unsafeValue), this.allow);
	}
}

/** Valid string from an allowed set of strings. */
export const ALLOW_STRING = <T extends string>(allow: Allowed<T>): AllowStringSchema<T> => new AllowStringSchema({ allow });

/** Valid string from an allowed set of numbers. */
export const ALLOW_NUMBER = <T extends number>(allow: Allowed<T>): AllowNumberSchema<T> => new AllowNumberSchema({ allow });
