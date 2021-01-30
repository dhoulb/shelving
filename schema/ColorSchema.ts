import type { RequiredOptions } from "./Schema";
import { StringOptionOptions, StringOptions, StringSchema } from "./StringSchema";

const R_MATCH = /^#[0-9A-F]{6}$/;
const R_STRIP = /[^0-9A-F]/g;

/**
 * Type of `StringSchema` that defines a valid Color.
 *
 * Ensures value is a string, enforces that the string is a valid Color.
 * Checks Color scheme against a whitelist (always), and checks Color domain against a whitelist (optional).
 * `null` is also a valid value if this field is not required.
 *
 * Colors are limited to 512 characters (this can be changed with `max`), but generally these won't be data: URIs so this is a reasonable limit.
 */
export class ColorSchema<T extends string> extends StringSchema<T> {
	readonly multiline = false;
	readonly max = 7;
	readonly match = R_MATCH;

	/**
	 * Clean a color string by removing characters that aren't 0-F.
	 * Might be empty string if the string contained only invalid characters.
	 */
	clean(str: string): string {
		const digits = str.toUpperCase().replace(R_STRIP, "");
		return digits ? `#${digits.slice(0, 6)}` : "";
	}
}

/** Shortcuts for ColorSchema. */
export const color: {
	<T extends string>(options: StringOptions<T> & StringOptionOptions<T> & RequiredOptions): ColorSchema<T>;
	<T extends string>(options: StringOptions<T> & StringOptionOptions<T>): ColorSchema<T | "">;
	(options: StringOptions<string> & RequiredOptions): ColorSchema<string>;
	(options: StringOptions<string>): ColorSchema<string | "">;
	required: ColorSchema<string>;
	optional: ColorSchema<string>;
} = Object.assign(<T extends string>(options: StringOptions<T>): ColorSchema<T> => new ColorSchema<T>(options), {
	required: new ColorSchema<string>({ required: true }),
	optional: new ColorSchema<string>({ required: false }),
});
