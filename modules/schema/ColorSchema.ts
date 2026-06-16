import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

const COLOR_REGEXP = /^#[0-9A-F]{6}$/;
const NOT_HEX_REGEXP = /[^0-9A-F]/g;

/**
 * Options for a `ColorSchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/ColorSchema/ColorSchemaOptions
 */
export interface ColorSchemaOptions extends Omit<StringSchemaOptions, "min" | "match" | "rows"> {}

/**
 * Schema that defines a valid color hex string, e.g. `#00CCFF`
 *
 * - Coerces the value to a six-digit uppercase `#RRGGBB` hex string.
 * - Rejects anything that isn't a valid hex color (use `NULLABLE_COLOR` to also allow `null`).
 *
 * @example COLOR.validate("00ccff"); // Returns "#00CCFF"
 * @see https://dhoulb.github.io/shelving/schema/ColorSchema/ColorSchema
 */
export class ColorSchema extends StringSchema {
	/**
	 * Create a new `ColorSchema`.
	 *
	 * @param options Options for the schema (inherits `StringSchema` options except `min`, `match`, and `rows`, which are fixed for hex colors).
	 * @param options.one Singular noun describing one value, used in error messages (defaults to `"color"`).
	 * @param options.title Title of the schema, e.g. for a corresponding field (defaults to `"Color"`).
	 * @param options.value Default hex value used when the input is `undefined` (defaults to `"#000000"`).
	 * @param options.input HTML `<input />` `type=""` hint (defaults to `"color"`).
	 * @param options.max Maximum allowed character length (defaults to `7`).
	 */
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
	/**
	 * Sanitize the string into a `#RRGGBB` hex color.
	 *
	 * - Uppercases the input and strips every non-hex character.
	 * - Prefixes the first six hex digits with `#`, or returns `""` when there are none.
	 *
	 * @param insaneString String to sanitize.
	 * @returns The sanitized hex color, or `""` if no hex digits are present.
	 * @example COLOR.sanitize("00ccff"); // Returns "#00CCFF"
	 * @see https://dhoulb.github.io/shelving/schema/ColorSchema/ColorSchema/sanitize
	 */
	override sanitize(insaneString: string): string {
		const saneString = insaneString.toUpperCase().replace(NOT_HEX_REGEXP, "");
		return saneString ? `#${saneString.slice(0, 6)}` : "";
	}
}

/**
 * Sugar instance of [`ColorSchema`](/schema/ColorSchema) for a required hex color string, e.g. `#00CCFF`. Equivalent to `new ColorSchema({})`.
 *
 * @example COLOR.validate("#00CCFF"); // Returns "#00CCFF"
 * @see https://dhoulb.github.io/shelving/schema/ColorSchema/COLOR
 */
export const COLOR = new ColorSchema({});

/**
 * Sugar instance allowing a [`COLOR`](/schema/COLOR) or `null`. Equivalent to `NULLABLE(COLOR)`.
 *
 * @example NULLABLE_COLOR.validate(null); // Returns null
 * @see https://dhoulb.github.io/shelving/schema/ColorSchema/NULLABLE_COLOR
 */
export const NULLABLE_COLOR = NULLABLE(COLOR);
