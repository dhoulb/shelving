import { sanitizeMultilineText, sanitizeText } from "../util/string.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * `type=""` prop for HTML `<input />` tags that are relevant for strings.
 *
 * @see https://dhoulb.github.io/shelving/schema/StringSchema/StringInputType
 */
export type StringInputType = "text" | "password" | "color" | "email" | "number" | "tel" | "search" | "url";

/**
 * Options for `StringSchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/StringSchema/StringSchemaOptions
 */
export interface StringSchemaOptions extends SchemaOptions {
	/**
	 * Default string value used when the input is `undefined`.
	 * @default ""
	 */
	readonly value?: string | undefined;
	/**
	 * Minimum allowed character length.
	 * @default 0
	 */
	readonly min?: number | undefined;
	/**
	 * Maximum allowed character length.
	 * @default Number.POSITIVE_INFINITY
	 */
	readonly max?: number | undefined;
	/**
	 * Number of rows; more than one enables multiline sanitization.
	 * @default 1
	 */
	readonly rows?: number | undefined;
	/** Regular expression the sanitized string must match. */
	readonly match?: RegExp | undefined;
	/** Force the result to `"upper"` or `"lower"` case. */
	readonly case?: "upper" | "lower" | undefined;
	/**
	 * HTML `<input />` `type=""` hint for downstream UIs.
	 * @default "text"
	 */
	readonly input?: StringInputType | undefined;
}

/**
 * Schema that defines a valid string.
 *
 * - Numbers are coerced to strings; all other non-string values are rejected.
 * - The value is sanitized (and optionally case-folded), then checked against `match`, `min`, and `max`.
 *
 * @example
 *  const schema = new StringSchema({ min: 2, max: 6, match: /^[a-z0-9]+$/ });
 *  schema.validate("def"); // Returns "def"
 *  schema.validate(1234); // Returns "1234" (numbers are coerced)
 *  schema.validate("j"); // Throws "Minimum 2 characters"
 *
 * @see https://dhoulb.github.io/shelving/schema/StringSchema/StringSchema
 */
export class StringSchema extends Schema<string> {
	declare readonly value: string;
	readonly input: StringInputType;
	readonly min: number;
	readonly max: number;
	readonly rows: number;
	readonly match: RegExp | undefined;
	readonly case: "upper" | "lower" | undefined;

	/**
	 * Create a new `StringSchema`.
	 */
	constructor({
		one = "string",
		min = 0,
		max = Number.POSITIVE_INFINITY,
		value = "",
		rows = 1,
		match,
		case: _case,
		input = "text",
		...options
	}: StringSchemaOptions) {
		super({ one, value, ...options });
		this.min = min;
		this.max = max;
		this.rows = rows;
		this.match = match;
		this.case = _case;
		this.input = input;
	}

	/**
	 * Validate an unknown value and coerce it to a sanitized string.
	 *
	 * @param value Value to validate (defaults to this schema's `value`).
	 * @returns The sanitized string value.
	 * @throws `string` `"Required"` if the value is empty or missing, `` `Must be ${one}` `` if it is not a string or number, `` `Invalid ${one}` `` if it fails `match`, `` `Minimum ${min} characters` `` if too short, or `` `Maximum ${max} characters` `` if too long.
	 *
	 * @example
	 *  STRING.validate(123); // Returns "123"
	 *
	 * @see https://dhoulb.github.io/shelving/schema/StringSchema/StringSchema/validate
	 */
	override validate(value: unknown = this.value): string {
		const str = typeof value === "number" ? value.toString() : value;
		if (typeof str !== "string") throw value ? `Must be ${this.one}` : "Required";
		const sane = this.sanitize(str);
		if (this.match && !this.match.test(sane)) throw str.length ? `Invalid ${this.one}` : "Required";
		if (sane.length < this.min) throw str.length ? `Minimum ${this.min} characters` : "Required";
		if (sane.length > this.max) throw `Maximum ${this.max} characters`;
		return sane;
	}

	/**
	 * Sanitize the string by removing unwanted characters.
	 *
	 * - Uses multiline sanitization when `rows` is greater than one, otherwise single-line sanitization.
	 * - Applies the configured `case` folding (`"upper"` or `"lower"`) if set.
	 *
	 * @param str String to sanitize.
	 * @returns The sanitized (and optionally case-folded) string.
	 *
	 * @example
	 *  STRING.sanitize("  hello  "); // Returns "hello"
	 *
	 * @see https://dhoulb.github.io/shelving/schema/StringSchema/StringSchema/sanitize
	 */
	sanitize(str: string): string {
		const sane = this.rows > 1 ? sanitizeMultilineText(str) : sanitizeText(str);
		if (this.case === "upper") return sane.toUpperCase();
		if (this.case === "lower") return sane.toLowerCase();
		return sane;
	}

	/**
	 * Format a string value for display (returns the string unchanged).
	 *
	 * @param str String value to format.
	 * @returns The same string value.
	 *
	 * @example
	 *  STRING.format("abc"); // Returns "abc"
	 *
	 * @see https://dhoulb.github.io/shelving/schema/StringSchema/StringSchema/format
	 */
	override format(str: string): string {
		return str;
	}
}

/**
 * Sugar instance of `StringSchema` for an unconstrained string. Equivalent to `new StringSchema({})`.
 *
 * @example
 *  STRING.validate(123); // Returns "123"
 *
 * @see https://dhoulb.github.io/shelving/schema/StringSchema/STRING
 */
export const STRING = new StringSchema({});

/**
 * Sugar instance of `StringSchema` requiring at least one character. Equivalent to `new StringSchema({ min: 1 })`.
 *
 * @example
 *  REQUIRED_STRING.validate(""); // Throws "Required"
 *
 * @see https://dhoulb.github.io/shelving/schema/StringSchema/REQUIRED_STRING
 */
export const REQUIRED_STRING = new StringSchema({ min: 1 });

/**
 * Sugar instance of `StringSchema` for a title of 1–100 characters. Equivalent to `new StringSchema({ one: "title", title: "Title", min: 1, max: 100 })`.
 *
 * @example
 *  TITLE.validate("My Title"); // Returns "My Title"
 *
 * @see https://dhoulb.github.io/shelving/schema/StringSchema/TITLE
 */
export const TITLE = new StringSchema({ one: "title", title: "Title", min: 1, max: 100 });

/**
 * Sugar instance allowing a `TITLE` or `null`. Equivalent to `NULLABLE(TITLE)`.
 *
 * @example
 *  NULLABLE_TITLE.validate(null); // Returns null
 *
 * @see https://dhoulb.github.io/shelving/schema/StringSchema/NULLABLE_TITLE
 */
export const NULLABLE_TITLE = NULLABLE(TITLE);

/**
 * Sugar instance of `StringSchema` for a name of 1–100 characters. Equivalent to `new StringSchema({ one: "name", title: "Name", min: 1, max: 100 })`.
 *
 * @example
 *  NAME.validate("Dave"); // Returns "Dave"
 *
 * @see https://dhoulb.github.io/shelving/schema/StringSchema/NAME
 */
export const NAME = new StringSchema({ one: "name", title: "Name", min: 1, max: 100 });

/**
 * Sugar instance allowing a `NAME` or `null`. Equivalent to `NULLABLE(NAME)`.
 *
 * @example
 *  NULLABLE_NAME.validate(null); // Returns null
 *
 * @see https://dhoulb.github.io/shelving/schema/StringSchema/NULLABLE_NAME
 */
export const NULLABLE_NAME = NULLABLE(NAME);
