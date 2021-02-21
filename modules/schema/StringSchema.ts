/* eslint-disable no-control-regex */

import { isObject } from "../object";
import { toString } from "../string";
import { isArray } from "../array";
import { InvalidFeedback } from "../feedback";
import { RequiredOptions, Schema, SchemaOptions } from "./Schema";

const R_CONTROL_CHARS = /[\x00-\x1F\x7F-\x9F]/g; // Match all control characters (00-1F, 7F-9F).
const R_CONTROL_CHARS_MULTILINE = /[\x00-\x08\x0B-\x1F\x7F-\x9F]/g; // Match all control characters (00-1F, 7F-9F) except `\x09` horizontal tab and `\x0A` line feed

export type StringOptions<T extends string> = SchemaOptions & {
	readonly value?: string;
	readonly required?: boolean;
	readonly min?: number;
	readonly max?: number | null;
	readonly match?: RegExp | null;
	readonly multiline?: boolean;
	readonly options?: ReadonlyArray<T> | { readonly [K in T]: string } | null;
};

export type StringOptionOptions<T extends string> = {
	readonly options: ReadonlyArray<T> | { readonly [K in T]: string };
};

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
export class StringSchema<T extends string> extends Schema<T> {
	readonly value;
	readonly min: number;
	readonly max: number | null;
	readonly options: ReadonlyArray<T> | { readonly [K in T]?: string } | null;
	readonly match: RegExp | null;
	readonly multiline: boolean;

	constructor({ value = "", min = 0, max = null, options = null, match = null, multiline = false, ...rest }: StringOptions<T>) {
		super(rest);
		this.value = value;
		this.min = min;
		this.max = max;
		this.options = options;
		this.match = match;
		this.multiline = multiline;
	}

	validate(unsafeValue: unknown = this.value): T {
		// Coorce.
		const uncleanValue = toString(unsafeValue);
		if (!uncleanValue && unsafeValue) throw new InvalidFeedback("Must be string"); // If original input was truthy, we know its format must have been wrong.

		// Clean.
		const value = this.clean(uncleanValue);

		// Empty?
		if (!value.length) {
			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required");

			// Return.
			return value as T;
		}

		// Check max/min.
		if (typeof this.max === "number" && value.length > this.max) throw new InvalidFeedback(`Maximum ${this.max} characters`);
		if (typeof this.min === "number" && value.length < this.min) throw new InvalidFeedback(`Minimum ${this.min} characters`);

		// Check enum format.
		if (isArray(this.options)) {
			if (!this.options.includes(value as T)) throw new InvalidFeedback("Unknown value");
		} else if (isObject(this.options)) {
			if (!Object.keys(this.options).includes(value.toString())) throw new InvalidFeedback("Unknown value");
		}

		// Check RegExp match format.
		if (this.match && !this.match.test(value)) throw new InvalidFeedback("Invalid format");

		// Return string.
		return value as T;
	}

	/**
	 * Clean a string by removing characters that aren't digits.
	 * Might be empty string if the string contained only invalid characters.
	 */
	clean(str: string): string {
		// Trim and always strip `\r` — only strip `\n` if multiline is truthy.
		return str.trim().replace(this.multiline ? R_CONTROL_CHARS_MULTILINE : R_CONTROL_CHARS, "");
	}
}

/** Shortcuts for StringSchema. */
export const string: {
	<T extends string>(options: StringOptions<T> & StringOptionOptions<T> & RequiredOptions): StringSchema<T>;
	<T extends string>(options: StringOptions<T> & StringOptionOptions<T>): StringSchema<T | "">;
	(options: StringOptions<string> & RequiredOptions): StringSchema<string>;
	(options: StringOptions<string>): StringSchema<string | "">;
	required: StringSchema<string>;
	optional: StringSchema<string>;
} = Object.assign(<T extends string>(options: StringOptions<T>): StringSchema<T> => new StringSchema<T>(options), {
	required: new StringSchema<string>({ required: true }),
	optional: new StringSchema<string>({ required: false }),
});
