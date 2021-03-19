import type { RequiredOptions } from "./Schema";
import { StringOptionOptions, StringOptions, StringSchema } from "./StringSchema";

// Valid phone number is max 16 digits made up of:
// - Country code (`+` plus character and 1-3 digits, e.g. `+44` or `+1`).
// - Subscriber number (5-12 digits — the Solomon Islands have five-digit phone numbers apparently).
const R_MATCH = /^\+[1-9][0-9]{0,2}[0-9]{5,12}$/;

/**
 * Type of `StringSchema` that defines a valid phone number.
 * - Multiple string formats are automatically converted to E.164 format (starting with `+` plus).
 * - Falsy values are converted to `""` empty string.
 */
export class PhoneSchema<T extends string> extends StringSchema<T> {
	readonly match = R_MATCH;
	readonly max: number = 16; // Valid phone number is 16 digits or fewer (15 numerals with a leading `+` plus).

	/**
	 * Clean a phone number string by removing characters that aren't digits.
	 * - Might be empty string if the string contained only invalid characters.
	 */
	sanitize(str: string): string {
		// Strip characters that aren't 0-9 or `+` plus (including whitespace).
		const digits = str.replace(/[^0-9+]/g, "");
		// Allow `+` plus only if it's first character.
		return digits.substr(0, 1) + digits.substr(1).replace(/[^0-9]/g, "");
	}
}

/** Shortcuts for PhoneSchema. */
export const phone: {
	<T extends string>(options: StringOptions<T> & StringOptionOptions<T> & RequiredOptions): PhoneSchema<T>;
	<T extends string>(options: StringOptions<T> & StringOptionOptions<T>): PhoneSchema<T | "">;
	(options: StringOptions<string> & RequiredOptions): PhoneSchema<string>;
	(options: StringOptions<string>): PhoneSchema<string | "">;
	required: PhoneSchema<string>;
	optional: PhoneSchema<string>;
} = Object.assign(<T extends string>(options: StringOptions<T>): PhoneSchema<T> => new PhoneSchema(options), {
	required: new PhoneSchema<string>({ required: true }),
	optional: new PhoneSchema<string>({ required: false }),
});
