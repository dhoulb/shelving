import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { type StringInputType, StringSchema } from "./StringSchema.js";

const COLOR_REGEXP = /^#[0-9A-F]{6}$/;
const NOT_HEX_REGEXP = /[^0-9A-F]/g;

/**
 * Options for a `ColorSchema`.
 *
 * - The length, format, and single-line constraints are fixed internally, so only the presentation-level string options are exposed.
 *
 * @see https://shelving.cc/schema/ColorSchemaOptions
 */
export interface ColorSchemaOptions extends SchemaOptions {
	/**
	 * Default hex value used when the input is `undefined`.
	 * @default "#000000"
	 */
	readonly value?: string | undefined;
	/**
	 * Maximum allowed character length.
	 * @default 7
	 */
	readonly max?: number | undefined;
	/** Force the result to `"upper"` or `"lower"` case. */
	readonly case?: "upper" | "lower" | undefined;
	/**
	 * HTML `<input />` `type=""` hint for downstream UIs.
	 * @default "color"
	 */
	readonly input?: StringInputType | undefined;
}

/**
 * Schema that defines a valid color hex string, e.g. `#00CCFF`
 *
 * - Coerces the value to a six-digit uppercase `#RRGGBB` hex string.
 * - Rejects anything that isn't a valid hex color (use `NULLABLE_COLOR` to also allow `null`).
 *
 * @example COLOR.validate("00ccff"); // Returns "#00CCFF"
 * @see https://shelving.cc/schema/ColorSchema
 */
export class ColorSchema extends StringSchema {
	constructor({ one = "color", title = "Color", value = "#000000", input = "color", max = 7, ...options }: ColorSchemaOptions) {
		super({
			one,
			title,
			value,
			...options,
			input,
			max,
			min: 1,
			rows: 1,
			match: COLOR_REGEXP,
		});
	}
	/** Uppercases and strips non-hex characters, returning the first six digits as `#RRGGBB` (or `""` if none). */
	override sanitize(insaneString: string): string {
		const saneString = insaneString.toUpperCase().replace(NOT_HEX_REGEXP, "");
		return saneString ? `#${saneString.slice(0, 6)}` : "";
	}
}

/**
 * Sugar instance of `ColorSchema` for a required hex color string, e.g. `#00CCFF`. Equivalent to `new ColorSchema({})`.
 *
 * @example COLOR.validate("#00CCFF"); // Returns "#00CCFF"
 * @see https://shelving.cc/schema/COLOR
 */
export const COLOR = new ColorSchema({});

/**
 * Sugar instance allowing a `COLOR` or `null`. Equivalent to `NULLABLE(COLOR)`.
 *
 * @example NULLABLE_COLOR.validate(null); // Returns null
 * @see https://shelving.cc/schema/NULLABLE_COLOR
 */
export const NULLABLE_COLOR = NULLABLE(COLOR);
