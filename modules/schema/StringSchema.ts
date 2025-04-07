import { ValueFeedback } from "../feedback/Feedback.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Function that sanitizes a string. */
export type Sanitizer = (str: string) => string;

/** Options for `StringSchema` */
export interface StringSchemaOptions extends SchemaOptions {
	readonly value?: string | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
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
	readonly min: number;
	readonly max: number;
	constructor({ min = 0, max = Number.POSITIVE_INFINITY, value = "", ...options }: StringSchemaOptions) {
		super({ value, ...options });
		this.min = min;
		this.max = max;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const possibleString = typeof unsafeValue === "number" ? unsafeValue.toString() : unsafeValue;
		if (typeof possibleString !== "string") throw new ValueFeedback("Must be string", unsafeValue);
		const saneString = this.sanitize(possibleString);
		if (saneString.length < this.min) throw new ValueFeedback(saneString ? `Minimum ${this.min} characters` : "Required", saneString);
		if (saneString.length > this.max) throw new ValueFeedback(`Maximum ${this.max} characters`, saneString);
		return saneString;
	}

	/** Sanitize the string by removing unwanted characters. */
	sanitize(str: string): string {
		return str;
	}
}

/** Valid string, e.g. `Hello there!` */
export const STRING = new StringSchema({});

/** Valid string, `Hello there!`, with more than one character. */
export const REQUIRED_STRING = new StringSchema({ min: 1 });
