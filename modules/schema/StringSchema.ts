import { sanitizeMultilineText, sanitizeText } from "../util/string.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** `type=""` prop for HTML `<input />` tags that are relevant for strings. */
export type StringInputType = "text" | "password" | "color" | "email" | "number" | "tel" | "search" | "url";

/** Options for `StringSchema` */
export interface StringSchemaOptions extends SchemaOptions {
	readonly value?: string | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
	readonly rows?: number | undefined;
	readonly match?: RegExp | undefined;
	readonly case?: "upper" | "lower" | undefined;
	readonly input?: StringInputType | undefined;
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

	override validate(value: unknown = this.value): string {
		const str = typeof value === "number" ? value.toString() : value;
		if (typeof str !== "string") throw value ? `Must be ${this.one}` : "Required";
		const sane = this.sanitize(str);
		if (this.match && !this.match.test(sane)) throw str.length ? `Invalid ${this.one}` : "Required";
		if (sane.length < this.min) throw str.length ? `Minimum ${this.min} characters` : "Required";
		if (sane.length > this.max) throw `Maximum ${this.max} characters`;
		return sane;
	}

	/** Sanitize the string by removing unwanted characters. */
	sanitize(str: string): string {
		const sane = this.rows > 1 ? sanitizeMultilineText(str) : sanitizeText(str);
		if (this.case === "upper") return sane.toUpperCase();
		if (this.case === "lower") return sane.toLowerCase();
		return sane;
	}

	override format(str: string): string {
		return str;
	}
}

/** Valid string, e.g. `Hello there!` */
export const STRING = new StringSchema({});

/** Valid string, `Hello there!`, with more than one character. */
export const REQUIRED_STRING = new StringSchema({ min: 1 });

/** Title string, e.g. `Title of something` */
export const TITLE = new StringSchema({ one: "title", title: "Title", min: 1, max: 100 });

/** Optional name string, e.g. `Title of something` or `null` */
export const NULLABLE_TITLE = NULLABLE(TITLE);

/** Name string, e.g. `Name of Something` */
export const NAME = new StringSchema({ one: "name", title: "Name", min: 1, max: 100 });

/** Optional name string, e.g. `Name of Something` or `null` */
export const NULLABLE_NAME = NULLABLE(NAME);
