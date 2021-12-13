import { sanitizeLines, sanitizeString } from "../util/index.js";
import { InvalidFeedback } from "../feedback/index.js";
import { Schema } from "./Schema.js";

/** `type=""` prop for HTML `<input />` tags that are relevant for strings. */
export type HtmlInputType = "text" | "password" | "color" | "date" | "email" | "number" | "tel" | "search" | "url";

/** Function that sanitizes a string. */
export type Sanitizer = (str: string) => string;

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
	readonly value: string;
	readonly type: HtmlInputType;
	readonly min: number;
	readonly max: number | null;
	readonly match: RegExp | null;
	readonly sanitizer: Sanitizer | null;
	readonly multiline: boolean;
	readonly trim: boolean;
	constructor({
		value = "",
		type = "text",
		min = 0,
		max = null,
		match = null,
		sanitizer = null,
		multiline = false,
		trim = true,
		...rest
	}: ConstructorParameters<typeof Schema>[0] & {
		readonly value?: string;
		readonly type?: HtmlInputType;
		readonly min?: number;
		readonly max?: number | null;
		readonly match?: RegExp | null;
		readonly sanitizer?: Sanitizer | null;
		readonly multiline?: boolean;
		readonly trim?: boolean;
	}) {
		super(rest);
		this.type = type;
		this.value = value;
		this.min = min;
		this.max = max;
		this.match = match;
		this.sanitizer = sanitizer;
		this.multiline = multiline;
		this.trim = trim;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const unsafeString = typeof unsafeValue === "number" ? unsafeValue.toString() : unsafeValue;
		if (typeof unsafeString !== "string") throw new InvalidFeedback("Must be string", { value: unsafeValue });
		const safeString = this.sanitize(unsafeString);
		if (safeString.length < this.min) throw new InvalidFeedback(safeString ? `Minimum ${this.min} characters` : "Required", { value: safeString });
		if (this.max && safeString.length > this.max) throw new InvalidFeedback(`Maximum ${this.max} characters`, { value: safeString });
		if (this.match && !this.match.test(safeString)) throw new InvalidFeedback(safeString ? "Invalid format" : "Required", { value: safeString });
		return safeString;
	}

	/**
	 * Clean a string by removing characters that aren't digits.
	 * - Might be empty string if the string contained only invalid characters.
	 * - Applies `options.sanitizer` too (if it's set).
	 */
	sanitize(uncleanString: string): string {
		return this.sanitizer
			? this.sanitizer(uncleanString)
			: this.multiline
			? sanitizeLines(uncleanString, this.trim)
			: sanitizeString(uncleanString, this.trim);
	}
}

/** Valid string, e.g. `Hello there!` */
export const STRING = new StringSchema({});

/** Valid string, `Hello there!`, with more than one character. */
export const REQUIRED_STRING = new StringSchema({ min: 1 });
