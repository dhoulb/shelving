import { isObject, sanitizeLines, sanitizeString, toString, isArray } from "../util";
import { InvalidFeedback } from "../feedback";
import { RequiredSchemaOptions, Schema, SchemaOptions } from "./Schema";

type StringSchemaOptions<T extends string> = SchemaOptions<T> & {
	readonly value?: string;
	readonly type?: string;
	readonly min?: number;
	readonly max?: number | null;
	readonly match?: RegExp | null;
	readonly multiline?: boolean;
	readonly trim?: boolean;
	readonly options?: ReadonlyArray<T> | { readonly [K in T]: string } | null;
	readonly sanitizer?: (value: string) => string;
};

type StringOptionOptions<T extends string> = {
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
	static REQUIRED: StringSchema<string> = new StringSchema({ required: true });
	static OPTIONAL: StringSchema<string> = new StringSchema({ required: false });

	static create<X extends string>(options: StringSchemaOptions<X> & StringOptionOptions<X> & RequiredSchemaOptions): StringSchema<X>;
	static create<X extends string>(options: StringSchemaOptions<X> & StringOptionOptions<X>): StringSchema<X | "">;
	static create(options: StringSchemaOptions<string> & RequiredSchemaOptions): StringSchema<string>;
	static create(options: StringSchemaOptions<string>): StringSchema<string | "">;
	static create(options: StringSchemaOptions<string>): StringSchema<string> {
		return new StringSchema(options);
	}

	readonly value;
	readonly type: string;
	readonly min: number;
	readonly max: number | null;
	readonly options: ReadonlyArray<T> | { readonly [K in T]?: string } | null;
	readonly match: RegExp | null;
	readonly multiline: boolean;
	readonly trim: boolean;
	readonly sanitizer?: (value: string) => string;

	protected constructor({
		value = "",
		type = "text",
		min = 0,
		max = null,
		options = null,
		match = null,
		multiline = false,
		trim = true,
		sanitizer,
		...rest
	}: StringSchemaOptions<T>) {
		super(rest);
		this.type = type;
		this.value = value;
		this.min = min;
		this.max = max;
		this.options = options;
		this.match = match;
		this.multiline = multiline;
		this.trim = trim;
		this.sanitizer = sanitizer;
	}

	validate(unsafeValue: unknown = this.value): T {
		// Coorce.
		const uncleanValue = toString(unsafeValue);
		if (!uncleanValue && unsafeValue) throw new InvalidFeedback("Must be string", { value: unsafeValue }); // If original input was truthy, we know its format must have been wrong.

		// Clean.
		const value = this.sanitize(uncleanValue);

		// Empty?
		if (!value.length) {
			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required", { value: uncleanValue });

			// Return empty string.
			return super.validate(value);
		}

		// Check max/min.
		if (typeof this.max === "number" && value.length > this.max) throw new InvalidFeedback(`Maximum ${this.max} characters`, { value });
		if (typeof this.min === "number" && value.length < this.min) throw new InvalidFeedback(`Minimum ${this.min} characters`, { value });

		// Check enum format.
		if (isArray(this.options)) {
			if (!this.options.includes(value as T)) throw new InvalidFeedback("Unknown value", { value });
		} else if (isObject(this.options)) {
			if (!Object.keys(this.options).includes(value.toString())) throw new InvalidFeedback("Unknown value", { value });
		}

		// Check RegExp match format.
		if (this.match && !this.match.test(value)) throw new InvalidFeedback("Invalid format", { value });

		// Return string.
		return super.validate(value);
	}

	/**
	 * Clean a string by removing characters that aren't digits.
	 * - Might be empty string if the string contained only invalid characters.
	 * - Applies `options.sanitizer` too (if it's set).
	 */
	sanitize(str: string): string {
		let output = str;
		if (this.multiline) {
			output = sanitizeLines(str);
			if (this.trim) output = output.replace(/\s+$/gm, "");
		} else {
			output = sanitizeString(str);
			if (this.trim) output = output.trim();
		}
		return this.sanitizer ? this.sanitizer(output) : output;
	}
}
