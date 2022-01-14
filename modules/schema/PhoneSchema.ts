import { StringSchema } from "./StringSchema.js";
import { OPTIONAL } from "./OptionalSchema.js";

// Valid phone number is max 16 digits made up of:
// - Country code (`+` plus character and 1-3 digits, e.g. `+44` or `+1`).
// - Subscriber number (5-12 digits — the Solomon Islands have five-digit phone numbers apparently).
const R_MATCH = /^\+[1-9][0-9]{0,2}[0-9]{5,12}$/;

/**
 * Type of `StringSchema` that defines a valid phone number.
 * - Multiple string formats are automatically converted to E.164 format (starting with `+` plus).
 * - Falsy values are converted to `""` empty string.
 */
export class PhoneSchema extends StringSchema {
	override readonly type = "tel";
	override readonly match = R_MATCH;
	override readonly min = 1;
	override readonly max: number = 16; // Valid phone number is 16 digits or fewer (15 numerals with a leading `+` plus).
	override sanitize(str: string): string {
		// Strip characters that aren't 0-9 or `+` plus (including whitespace).
		const digits = str.replace(/[^0-9+]/g, "");
		// Allow `+` plus only if it's first character.
		return digits.slice(0, 1) + digits.slice(1).replace(/[^0-9]/g, "");
	}
}

/** Valid phone number, e.g. `+441234567890` */
export const PHONE = new PhoneSchema({});

/** Valid phone number, e.g. `+441234567890`, or `null` */
export const OPTIONAL_PHONE = OPTIONAL(PHONE);
