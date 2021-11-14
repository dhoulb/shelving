import { SchemaOptions } from "../index.js";
import { StringSchema } from "./StringSchema.js";

const R_MATCH = /^#[0-9A-F]{6}$/;
const R_STRIP = /[^0-9A-F]/g;

type ColorSchemaOptions = SchemaOptions<string> & {
	readonly value?: string;
};

/**
 * Type of `StringSchema` that defines a valid Color.
 *
 * Ensures value is a string, enforces that the string is a valid Color.
 * Checks Color scheme against a whitelist (always), and checks Color domain against a whitelist (optional).
 * `null` is also a valid value if this field is not required.
 *
 * Colors are limited to 512 characters (this can be changed with `max`), but generally these won't be data: URIs so this is a reasonable limit.
 */
export class ColorSchema extends StringSchema<string> {
	static override REQUIRED = new ColorSchema({ required: true });
	static override OPTIONAL = new ColorSchema({ required: false });

	static override create(options: ColorSchemaOptions): ColorSchema {
		return new ColorSchema(options);
	}

	override readonly max = 7;
	override readonly type = "color";
	override readonly multiline = false;
	override readonly match = R_MATCH;

	/**
	 * Clean a color string by removing characters that aren't 0-F.
	 * Might be empty string if the string contained only invalid characters.
	 */
	override sanitize(str: string): string {
		const digits = str.toUpperCase().replace(R_STRIP, "");
		return digits ? `#${digits.slice(0, 6)}` : "";
	}
}
