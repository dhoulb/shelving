import { sanitizeWord } from "../util/string.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { type StringInputType, StringSchema } from "./StringSchema.js";

const R_MATCH =
	/^[a-z0-9](?:[a-zA-Z0-9._+-]{0,62}[a-zA-Z0-9])?@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.){1,3}(?:[a-z]{2,63}|xn--[a-z0-9-]{0,58}[a-z0-9])$/;

/**
 * Options for an `EmailSchema`.
 *
 * - The length, format, and single-line constraints are fixed internally, so only the presentation-level string options are exposed.
 *
 * @see https://shelving.cc/schema/EmailSchemaOptions
 */
export interface EmailSchemaOptions extends SchemaOptions {
	/** Default string value used when the input is `undefined`. */
	readonly value?: string | undefined;
	/**
	 * Maximum allowed character length.
	 * @default 254
	 */
	readonly max?: number | undefined;
	/** Force the result to `"upper"` or `"lower"` case. */
	readonly case?: "upper" | "lower" | undefined;
	/**
	 * HTML `<input />` `type=""` hint for downstream UIs.
	 * @default "email"
	 */
	readonly input?: StringInputType | undefined;
}

/**
 * Schema that defines a valid email address.
 *
 * - Falsy values are converted to `""` empty string.
 * - Total length must be 254 characters or fewer (in SMTP email is encoded with `<` and `>` to make 256 characters).
 * - No minimum length is enforced because the email's format is enforced instead.
 * - RFC specifies username _should_ be case insensitive to avoid confusion.
 *     - We lowercase the entire address as a simple way to enforce this.
 *     - This is technically incorrect but practically better, and avoids case insensitive lookups in databases etc.
 * - Username portion must be 64 characters or fewer from the range `[a-z0-9.!#$%&’*+/=?^_`{|}~-]`
 *     - We subset this to `[a-z0-9._+-]` with no special characters at start/end (and we lowercase automatically).
 *     - If someone uses e.g. `*` asterisk at all or '-' at the start then it's most likely to be a mistake.
 * - Server portion must be a valid domain
 *     - Limited to `[a-z0-9]` with mid-word hyphens only.
 *     - Up to 10 segments of up to 63 characters each, separated by `.`
 *     - TLD is a segment of 2-63 characters, possibly in `xn--` international format.
 *
 * @example EMAIL.validate("Test@Test.com"); // Returns "test@test.com"
 * @see https://shelving.cc/schema/EmailSchema
 */
export class EmailSchema extends StringSchema {
	constructor({ one = "email address", title = "Email", input = "email", max = 254, ...options }: EmailSchemaOptions) {
		super({
			one,
			title,
			...options,
			input,
			max,
			min: 1,
			rows: 1,
			match: R_MATCH,
		});
	}
	/** Strips all whitespace and lowercases the address. */
	override sanitize(str: string): string {
		// Email addresses never contain whitespace, so strip it entirely, then lowercase (RFC says addresses should be case-insensitive).
		return sanitizeWord(str).toLowerCase();
	}
}

/**
 * Sugar instance of `EmailSchema` for a valid email address. Equivalent to `new EmailSchema({})`.
 *
 * @example EMAIL.validate("test@test.com"); // Returns "test@test.com"
 * @see https://shelving.cc/schema/EMAIL
 */
export const EMAIL = new EmailSchema({});

/**
 * Sugar instance allowing an `EMAIL` or `null`. Equivalent to `NULLABLE(EMAIL)`.
 *
 * @example NULLABLE_EMAIL.validate(null); // Returns null
 * @see https://shelving.cc/schema/NULLABLE_EMAIL
 */
export const NULLABLE_EMAIL = NULLABLE(EMAIL);
