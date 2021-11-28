import { isItem, isKey, toString } from "../util/index.js";
import { InvalidFeedback } from "../feedback/index.js";
import { Schema } from "./Schema.js";

/** Specify a specific list of allowed values. */
export type AllowedOptions<T extends string> = ReadonlyArray<T> | { readonly [K in T]: string };

/** Validate a value against a specific set of allowed values. */
export function validateAllowed<T extends string>(unsafeString: string, allowed: AllowedOptions<T>): T {
	if (allowed instanceof Array) {
		if (isItem(allowed, unsafeString)) return unsafeString;
	} else {
		if (isKey(allowed, unsafeString)) return unsafeString;
	}
	throw new InvalidFeedback("Unknown value", { value: unsafeString });
}

/** Define a valid string from an allowed set of strings. */
export class AllowSchema<T extends string> extends Schema<T> {
	readonly allow: AllowedOptions<T>;
	readonly value: T | null;
	constructor({
		allow,
		value = null,
		...options
	}: ConstructorParameters<typeof Schema>[0] & {
		allow: AllowedOptions<T>;
		value?: T | null;
	}) {
		super(options);
		this.allow = allow;
		this.value = value;
	}
	validate(unsafeValue: unknown = this.value): T {
		return validateAllowed(toString(unsafeValue), this.allow);
	}
}

/** Valid string from an allowed set of strings. */
export const ALLOW = <T extends string>(allow: AllowedOptions<T>): AllowSchema<T> => new AllowSchema({ allow: allow });
