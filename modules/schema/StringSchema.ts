import { sanitizeMultilineText, sanitizeText } from "../util/string.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * `type=""` prop for HTML `<input />` tags that are relevant for strings.
 *
 * @see https://shelving.cc/schema/StringInputType
 */
export type StringInputType = "text" | "password" | "color" | "email" | "number" | "tel" | "search" | "url";

/**
 * Options for `StringSchema`.
 *
 * @see https://shelving.cc/schema/StringSchemaOptions
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
 * @see https://shelving.cc/schema/StringSchema
 */
export class StringSchema extends Schema<string> {
	declare readonly value: string;
	readonly input: StringInputType;
	readonly min: number;
	readonly max: number;
	readonly rows: number;
	readonly match: RegExp | undefined;
	readonly case: "upper" | "lower" | undefined;

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

	/** Coerce a value to a string, `sanitize()` it, then enforce `match`, `min`, and `max`. */
	override validate(value: unknown = this.value): string {
		const str = typeof value === "number" ? value.toString() : value;
		if (typeof str !== "string") throw value ? `Must be ${this.one}` : "Required";
		const sane = this.sanitize(str);
		// Enforce `max` before running `match`, so an over-length string is rejected without ever being handed to
		// the (potentially expensive) regex — a length cap can't shield the pattern otherwise. `min` stays after
		// `match` to preserve the existing "Invalid" precedence for short-but-malformed values.
		if (sane.length > this.max) throw `Maximum ${this.max} characters`;
		if (this.match && !this.match.test(sane)) throw str.length ? `Invalid ${this.one}` : "Required";
		if (sane.length < this.min) throw str.length ? `Minimum ${this.min} characters` : "Required";
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
	 * @example STRING.sanitize("  hello  ") // "hello"
	 * @see https://shelving.cc/schema/StringSchema/sanitize
	 */
	sanitize(str: string): string {
		const sane = this.rows > 1 ? sanitizeMultilineText(str) : sanitizeText(str);
		if (this.case === "upper") return sane.toUpperCase();
		if (this.case === "lower") return sane.toLowerCase();
		return sane;
	}

	/** Returns the string unchanged. */
	override format(str: string): string {
		return str;
	}
}

/**
 * Sugar instance of `StringSchema` for an unconstrained string. Equivalent to `new StringSchema({})`.
 *
 * @example STRING.validate(123); // Returns "123"
 * @see https://shelving.cc/schema/STRING
 */
export const STRING = new StringSchema({});

/**
 * Sugar instance of `StringSchema` requiring at least one character. Equivalent to `new StringSchema({ min: 1 })`.
 *
 * @example REQUIRED_STRING.validate(""); // Throws "Required"
 * @see https://shelving.cc/schema/REQUIRED_STRING
 */
export const REQUIRED_STRING = new StringSchema({ min: 1 });

/**
 * Sugar instance of `StringSchema` for a title of 1–100 characters. Equivalent to `new StringSchema({ one: "title", title: "Title", min: 1, max: 100 })`.
 *
 * @example TITLE.validate("My Title"); // Returns "My Title"
 * @see https://shelving.cc/schema/TITLE
 */
export const TITLE = new StringSchema({ one: "title", title: "Title", min: 1, max: 100 });

/**
 * Sugar instance allowing a `TITLE` or `null`. Equivalent to `NULLABLE(TITLE)`.
 *
 * @example NULLABLE_TITLE.validate(null); // Returns null
 * @see https://shelving.cc/schema/NULLABLE_TITLE
 */
export const NULLABLE_TITLE = NULLABLE(TITLE);

/**
 * Sugar instance of `StringSchema` for a name of 1–100 characters. Equivalent to `new StringSchema({ one: "name", title: "Name", min: 1, max: 100 })`.
 *
 * @example NAME.validate("Dave"); // Returns "Dave"
 * @see https://shelving.cc/schema/NAME
 */
export const NAME = new StringSchema({ one: "name", title: "Name", min: 1, max: 100 });

/**
 * Sugar instance allowing a `NAME` or `null`. Equivalent to `NULLABLE(NAME)`.
 *
 * @example NULLABLE_NAME.validate(null); // Returns null
 * @see https://shelving.cc/schema/NULLABLE_NAME
 */
export const NULLABLE_NAME = NULLABLE(NAME);
