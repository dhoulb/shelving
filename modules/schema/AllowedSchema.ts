import { isItem, isKey, toString } from "../util/index.js";
import { InvalidFeedback } from "../feedback/index.js";
import { Schema } from "./Schema.js";

/** Specify a specific list of allowed values. */
export type Allowed<T extends string> = ReadonlyArray<T> | { readonly [K in T]: string };

/** Validate a value against a specific set of allowed values. */
export function validateAllowed<T extends string>(unsafeString: string, allowed: Allowed<T>): T {
	if (allowed instanceof Array) {
		if (isItem(allowed, unsafeString)) return unsafeString;
	} else {
		if (isKey(allowed, unsafeString)) return unsafeString;
	}
	throw new InvalidFeedback("Unknown value", { value: unsafeString });
}

/** Define a valid string from an allowed set of strings. */
export class AllowedSchema<T extends string> extends Schema<T> {
	readonly allow: Allowed<T>;
	constructor({
		allow,
		...options
	}: ConstructorParameters<typeof Schema>[0] & {
		allow: Allowed<T>;
	}) {
		super(options);
		this.allow = allow;
	}
	validate(unsafeValue: unknown): T {
		const unsafeString = toString(unsafeValue);
		return validateAllowed(unsafeString, this.allow);
	}
}

/** Valid string from an allowed set of strings. */
export const ALLOW = <T extends string>(allow: Allowed<T>): AllowedSchema<T> => new AllowedSchema({ allow });
