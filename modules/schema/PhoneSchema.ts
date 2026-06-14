import { NULLABLE } from "./NullableSchema.js";
import type { StringSchemaOptions } from "./StringSchema.js";
import { StringSchema } from "./StringSchema.js";

/**
 * Options for a `PhoneSchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/PhoneSchema/PhoneSchemaOptions
 */
export interface PhoneSchemaOptions extends Omit<StringSchemaOptions, "input" | "min" | "max" | "match" | "rows"> {}

/**
 * Schema that defines a valid phone number.
 *
 * - Multiple string formats are automatically converted to E.164 format (starting with `+` plus).
 * - Falsy values are converted to `""` empty string.
 *
 * @example PHONE.validate("+44 1234 567890"); // Returns "+441234567890"
 * @see https://dhoulb.github.io/shelving/schema/PhoneSchema/PhoneSchema
 */
export class PhoneSchema extends StringSchema {
	/**
	 * Create a new `PhoneSchema`.
	 *
	 * @param options Options for the schema (inherits `StringSchema` options except `input`, `min`, `max`, `match`, and `rows`, which are fixed for phone numbers).
	 * @param options.one Singular noun describing one value, used in error messages (defaults to `"phone number"`).
	 * @param options.title Title of the schema, e.g. for a corresponding field (defaults to `"Phone"`).
	 */
	constructor({ one = "phone number", title = "Phone", ...options }: PhoneSchemaOptions) {
		super({
			one,
			title,
			...options,
			input: "tel",
			min: 1,
			// Valid phone number is 16 digits or fewer (15 numerals with a leading `+` plus).
			max: 16,
			rows: 1,
			// Valid phone number is max 16 digits made up of:
			// - Country code (`+` plus character and 1-3 digits, e.g. `+44` or `+1`).
			// - Subscriber number (5-12 digits — the Solomon Islands have five-digit phone numbers apparently).
			match: /^\+[1-9][0-9]{0,2}[0-9]{5,12}$/,
		});
	}
	/**
	 * Sanitize the string into a valid E.164 phone number.
	 *
	 * - Strips every character that isn't `0`–`9` or `+` plus (including whitespace).
	 * - Keeps a `+` plus only when it is the first character.
	 *
	 * @param insaneString String to sanitize.
	 * @returns The sanitized phone number.
	 * @example PHONE.sanitize("+44 (1234) 567890"); // Returns "+441234567890"
	 * @see https://dhoulb.github.io/shelving/schema/PhoneSchema/PhoneSchema/sanitize
	 */
	override sanitize(insaneString: string): string {
		// Strip characters that aren't 0-9 or `+` plus (including whitespace).
		const saneString = insaneString.replace(/[^0-9+]/g, "");
		// Allow `+` plus only if it's first character.
		return saneString.slice(0, 1) + saneString.slice(1).replace(/[^0-9]/g, "");
	}
}

/**
 * Valid phone number, e.g. `+441234567890`
 *
 * @example PHONE.validate("+441234567890"); // Returns "+441234567890"
 * @see https://dhoulb.github.io/shelving/schema/PhoneSchema/PHONE
 */
export const PHONE = new PhoneSchema({});

/**
 * Valid phone number, e.g. `+441234567890`, or `null`
 *
 * @example NULLABLE_PHONE.validate(null); // Returns null
 * @see https://dhoulb.github.io/shelving/schema/PhoneSchema/NULLABLE_PHONE
 */
export const NULLABLE_PHONE = NULLABLE(PHONE);
