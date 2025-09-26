import { ValueFeedback } from "../feedback/Feedback.js";
import { sanitizeMultilineText, sanitizeText } from "../util/string.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** `type=""` prop for HTML `<input />` tags that are relevant for strings. */
export type HTMLInputType = "text" | "password" | "color" | "email" | "number" | "tel" | "search" | "url";

/** Options for `StringSchema` */
export interface StringSchemaOptions extends SchemaOptions {
	readonly value?: string | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
	readonly multiline?: boolean | undefined;
	readonly match?: RegExp | undefined;
	readonly case?: "upper" | "lower" | undefined;
	readonly input?: HTMLInputType | undefined;
}

/**
 * Schema that defines a valid string.
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
	readonly input: HTMLInputType;
	readonly min: number;
	readonly max: number;
	readonly multiline: boolean;
	readonly match: RegExp | undefined;
	readonly case: "upper" | "lower" | undefined;

	constructor({
		min = 0,
		max = Number.POSITIVE_INFINITY,
		value = "",
		multiline = false,
		match,
		case: _case,
		input = "text",
		...options
	}: StringSchemaOptions) {
		super({ value, ...options });
		this.min = min;
		this.max = max;
		this.multiline = multiline;
		this.match = match;
		this.case = _case;
		this.input = input;
	}

	override validate(unsafeValue: unknown = this.value): string {
		const possibleString = typeof unsafeValue === "number" ? unsafeValue.toString() : unsafeValue;
		if (typeof possibleString !== "string") throw new ValueFeedback("Must be string", unsafeValue);
		const saneString = this.sanitize(possibleString);
		if (saneString.length < this.min)
			throw new ValueFeedback(possibleString.length ? `Minimum ${this.min} characters` : "Required", saneString);
		if (saneString.length > this.max) throw new ValueFeedback(`Maximum ${this.max} characters`, saneString);
		if (this.match && !this.match.test(saneString)) throw new ValueFeedback(saneString ? "Invalid format" : "Required", saneString);
		return saneString;
	}

	/** Sanitize the string by removing unwanted characters. */
	sanitize(str: string): string {
		const sane = this.multiline ? sanitizeMultilineText(str) : sanitizeText(str);
		if (this.case === "upper") return sane.toUpperCase();
		if (this.case === "lower") return sane.toLowerCase();
		return sane;
	}
}

/** Valid string, e.g. `Hello there!` */
export const STRING = new StringSchema({});

/** Valid string, `Hello there!`, with more than one character. */
export const REQUIRED_STRING = new StringSchema({ min: 1 }); /** Valid text, e.g. `Hello there!` */

export const TEXT = new StringSchema({ title: "Text" });
/** Valid text, `Hello there!`, with more than one character. */

export const REQUIRED_TEXT = new StringSchema({ min: 1 });
/** Title string, e.g. `Title of something` */

export const TITLE = new StringSchema({ title: "Title", min: 1, max: 100 });
/** Optional name string, e.g. `Title of something` or `null` */

export const NULLABLE_TITLE = NULLABLE(TITLE);
/** Name string, e.g. `Name of Something` */

export const NAME = new StringSchema({ title: "Name", min: 1, max: 100 });
/** Optional name string, e.g. `Name of Something` or `null` */

export const NULLABLE_NAME = NULLABLE(NAME);
/** Password string. */

export const PASSWORD = new StringSchema({ title: "Password", min: 6, input: "password" });
