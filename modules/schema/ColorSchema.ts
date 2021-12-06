import { NULLABLE } from "./NullableSchema.js";
import { StringSchema } from "./StringSchema.js";

const R_MATCH = /^#[0-9A-F]{6}$/;
const R_STRIP = /[^0-9A-F]/g;

/**
 * Define a valid color hex string, e.g `#00CCFF`
 *
 * Ensures value is a string, enforces that the string is a valid Color.
 * Checks Color scheme against a whitelist (always), and checks Color domain against a whitelist (optional).
 * `null` is also a valid value if this field is not required.
 *
 * Colors are limited to 512 characters (this can be changed with `max`), but generally these won't be data: URIs so this is a reasonable limit.
 */
export class ColorSchema extends StringSchema {
	override readonly type = "color";
	override readonly min = 1;
	override readonly max = 7;
	override readonly multiline = false;
	override readonly match = R_MATCH;
	override sanitize(uncleanString: string): string {
		const cleanDigits = uncleanString.toUpperCase().replace(R_STRIP, "");
		return cleanDigits ? `#${cleanDigits.slice(0, 6)}` : "";
	}
}

/** Valid color hex string, e.g. `#00CCFF` (required because empty string is invalid). */
export const REQUIRED_COLOR = new ColorSchema({});

/** Valid color hex string, e.g. `#00CCFF`, or `null` */
export const OPTIONAL_COLOR = NULLABLE(REQUIRED_COLOR);
