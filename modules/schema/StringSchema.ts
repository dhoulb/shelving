import type { SchemaOptions } from "./Schema.js";
import { ValueFeedback } from "../feedback/Feedback.js";
import { sanitizeLines, sanitizeString } from "../util/string.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { Schema } from "./Schema.js";

/** `type=""` prop for HTML `<input />` tags that are relevant for strings. */
export type HtmlInputType = "text" | "password" | "color" | "date" | "email" | "number" | "tel" | "search" | "url";

/** Function that sanitizes a string. */
export type Sanitizer = (str: string) => string;

/** Options for `StringSchema` */
export interface StringSchemaOptions extends SchemaOptions {
	readonly value?: string | undefined;
	readonly type?: HtmlInputType | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
	readonly match?: RegExp | undefined;
	readonly sanitizer?: Sanitizer | undefined;
	readonly multiline?: boolean | undefined;
}

/**
 * Schema that defines a valid string.
 *
 * Ensures value is string and optionally enforces min/max length, whether to trim whitespace, and regex match format.
 * Doesn't allow `null` to mean no value — empty string is the equivalent for StringSchema (because it means we'll never accidentally get `"null"` by converting the `null` to string).
 *
 * Defaults to a single line text string (newlines are stripped). Use `multiline=true` to allow newlines.
 *
 * @example
 *  const schema = new StringSchema({ default: 'abc', required: true, min: 2, max: 6, match: /^[a-z0-9]+$/, trim: true });
 *  schema.validate('def'); // Returns 'def'
 *  schema.validate('abcdefghijk'); // Returns 'abcdef' (due to max)
 *  schema.validate(undefined); // Returns 'abc' (due to value)
 *  schema.validate('   ghi   '); // Returns 'ghi' (due to schema.trim, defaults to true)
 *  schema.validate(1234); // Returns '1234' (numbers are converted to strings)
 *  schema.validate('---'); // Throws 'Incorrect)
 *  schema.validate(true); // Throws 'Must be)
 *  schema.validate(''); // Throws Required
 *  schema.validate('j'); // Throws 'Minimum 3 chaacters'
 */
export class StringSchema extends Schema<string> {
	declare readonly value: string;
	readonly type: HtmlInputType;
	readonly min: number;
	readonly max: number;
	readonly match: RegExp | undefined;
	readonly sanitizer: Sanitizer | undefined;
	readonly multiline: boolean;
	constructor({ type = "text", min = 0, max = Infinity, match, sanitizer, multiline = false, value = "", ...options }: StringSchemaOptions) {
		super({ value, ...options });
		this.type = type;
		this.min = min;
		this.max = max;
		this.match = match;
		this.sanitizer = sanitizer;
		this.multiline = multiline;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const possibleString = typeof unsafeValue === "number" ? unsafeValue.toString() : unsafeValue;
		if (typeof possibleString !== "string") throw new ValueFeedback("Must be string", unsafeValue);
		const saneString = this.sanitize(possibleString);
		if (saneString.length < this.min) throw new ValueFeedback(saneString ? `Minimum ${this.min} characters` : "Required", saneString);
		if (saneString.length > this.max) throw new ValueFeedback(`Maximum ${this.max} characters`, saneString);
		if (this.match && !this.match.test(saneString)) throw new ValueFeedback(saneString ? "Invalid format" : "Required", saneString);
		return saneString;
	}

	/**
	 * Clean a string by removing characters that aren't digits.
	 * - Might be empty string if the string contained only invalid characters.
	 * - Applies `options.sanitizer` too (if it's set).
	 */
	sanitize(insaneString: string): string {
		return this.sanitizer ? this.sanitizer(insaneString) : this.multiline ? sanitizeLines(insaneString) : sanitizeString(insaneString);
	}
}

/** Valid string, e.g. `Hello there!` */
export const STRING = new StringSchema({});

/** Valid string, `Hello there!`, with more than one character. */
export const REQUIRED_STRING = new StringSchema({ min: 1 });

/** Title string, e.g. `Title of something` */
export const TITLE = new StringSchema({});

/** Optional name string, e.g. `Title of something` or `null` */
export const OPTIONAL_TITLE = OPTIONAL(TITLE);

/** Name string, e.g. `Name of Something` */
export const NAME = new StringSchema({ title: "Name" });

/** Optional name string, e.g. `Name of Something` or `null` */
export const OPTIONAL_NAME = OPTIONAL(NAME);

/** Password string. */
export const PASSWORD = new StringSchema({ title: "Password", min: 6, type: "password" });
