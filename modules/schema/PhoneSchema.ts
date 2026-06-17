import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { type StringInputType, StringSchema } from "./StringSchema.js";

/**
 * Options for a `PhoneSchema`.
 *
 * - The length, format, and single-line constraints are fixed internally, so only the presentation-level string options are exposed.
 *
 * @see https://dhoulb.github.io/shelving/schema/PhoneSchema/PhoneSchemaOptions
 */
export interface PhoneSchemaOptions extends SchemaOptions {
	/** Default string value used when the input is `undefined`. */
	readonly value?: string | undefined;
	/** Maximum allowed character length. */
	readonly max?: number | undefined;
	/** Force the result to `"upper"` or `"lower"` case. */
	readonly case?: "upper" | "lower" | undefined;
	/** HTML `<input />` `type=""` hint for downstream UIs. */
	readonly input?: StringInputType | undefined;
}

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
	 * @param options Options for the schema (presentation string options like `value`, `max`, `case`, `input`; length and format are fixed for phone numbers).
	 * @param options.one Singular noun describing one value, used in error messages (defaults to `"phone number"`).
	 * @param options.title Title of the schema, e.g. for a corresponding field (defaults to `"Phone"`).
	 * @param options.input HTML `<input />` `type=""` hint (defaults to `"tel"`).
	 * @param options.max Maximum allowed character length (defaults to `16`).
	 */
	constructor({ one = "phone number", title = "Phone", input = "tel", max = 16, ...options }: PhoneSchemaOptions) {
		super({
			one,
			title,
			...options,
			input,
			// Valid phone number is 16 digits or fewer (15 numerals with a leading `+` plus).
			max,
			min: 1,
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
 * Sugar instance of [`PhoneSchema`](/schema/PhoneSchema) for a valid phone number. Equivalent to `new PhoneSchema({})`.
 *
 * @example PHONE.validate("+441234567890"); // Returns "+441234567890"
 * @see https://dhoulb.github.io/shelving/schema/PhoneSchema/PHONE
 */
export const PHONE = new PhoneSchema({});

/**
 * Sugar instance allowing a [`PHONE`](/schema/PHONE) or `null`. Equivalent to `NULLABLE(PHONE)`.
 *
 * @example NULLABLE_PHONE.validate(null); // Returns null
 * @see https://dhoulb.github.io/shelving/schema/PhoneSchema/NULLABLE_PHONE
 */
export const NULLABLE_PHONE = NULLABLE(PHONE);
