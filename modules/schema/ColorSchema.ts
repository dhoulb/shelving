import type { StringSchemaOptions } from "./StringSchema.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { StringSchema } from "./StringSchema.js";

const COLOR_REGEXP = /^#[0-9A-F]{6}$/;
const NOT_HEX_REGEXP = /[^0-9A-F]/g;

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
	constructor({ title = "Color", value = "#000000", ...options }: Omit<StringSchemaOptions, "type" | "min" | "max" | "multiline" | "match">) {
		super({
			title,
			value,
			...options,
			type: "color",
			min: 1,
			max: 7,
			multiline: false,
			match: COLOR_REGEXP,
		});
	}
	override sanitize(insaneString: string): string {
		const saneString = insaneString.toUpperCase().replace(NOT_HEX_REGEXP, "");
		return saneString ? `#${saneString.slice(0, 6)}` : "";
	}
}

/** Valid color hex string, e.g. `#00CCFF` (required because empty string is invalid). */
export const COLOR = new ColorSchema({});

/** Valid color hex string, e.g. `#00CCFF`, or `null` */
export const OPTIONAL_COLOR = OPTIONAL(COLOR);
