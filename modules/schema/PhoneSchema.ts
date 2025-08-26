import { NULLABLE } from "./NullableSchema.js";
import type { StringSchemaOptions } from "./StringSchema.js";
import { TextSchema } from "./TextSchema.js";

// Valid phone number is max 16 digits made up of:
// - Country code (`+` plus character and 1-3 digits, e.g. `+44` or `+1`).
// - Subscriber number (5-12 digits — the Solomon Islands have five-digit phone numbers apparently).
const PHONE_REGEXP = /^\+[1-9][0-9]{0,2}[0-9]{5,12}$/;

/**
 * Type of `StringSchema` that defines a valid phone number.
 * - Multiple string formats are automatically converted to E.164 format (starting with `+` plus).
 * - Falsy values are converted to `""` empty string.
 */
export class PhoneSchema extends TextSchema {
	constructor({ title = "Phone", ...options }: StringSchemaOptions) {
		super({
			title,
			...options,
			type: "tel",
			min: 1,
			max: 16, // Valid phone number is 16 digits or fewer (15 numerals with a leading `+` plus).
			match: PHONE_REGEXP,
			multiline: false,
		});
	}
	override sanitize(insaneString: string): string {
		// Strip characters that aren't 0-9 or `+` plus (including whitespace).
		const saneString = insaneString.replace(/[^0-9+]/g, "");
		// Allow `+` plus only if it's first character.
		return saneString.slice(0, 1) + saneString.slice(1).replace(/[^0-9]/g, "");
	}
}

/** Valid phone number, e.g. `+441234567890` */
export const PHONE = new PhoneSchema({});

/** Valid phone number, e.g. `+441234567890`, or `null` */
export const NULLABLE_PHONE = NULLABLE(PHONE);
