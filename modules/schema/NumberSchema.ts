import { formatNumber } from "../util/format.js";
import { getNumber, roundStep } from "../util/number.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Allowed options for `NumberSchema`.
 *
 * - `value` — default number value used when the input is `undefined`.
 * - `min`/`max` — minimum and maximum allowed value.
 * - `step` — rounding step the value is snapped to (e.g. `1` for integers).
 * - `format` — function used to render the number for display in downstream UIs.
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NumberSchemaOptions
 */
export interface NumberSchemaOptions extends SchemaOptions {
	readonly value?: number | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
	readonly step?: number | undefined;
	/** Format the number for display in downstream UIs. */
	readonly format?: typeof formatNumber | undefined;
}

/**
 * Schema that defines a valid number.
 *
 * - Values are coerced with `getNumber`; anything that cannot become a number is rejected.
 * - The number is snapped to `step` (if set), then checked against `min` and `max`.
 *
 * @example
 *  const schema = new NumberSchema({ min: 0, max: 100, step: 1 });
 *  schema.validate("42"); // Returns 42
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NumberSchema
 */
export class NumberSchema extends Schema<number> {
	declare readonly value: number | undefined;
	readonly min: number;
	readonly max: number;
	readonly step: number | undefined;
	/**
	 * Create a new `NumberSchema`.
	 *
	 * @param options Options for the schema.
	 * @param options.one Singular noun describing one value, used in error messages (defaults to `"number"`).
	 * @param options.title Human-readable title for the schema (defaults to `"Number"`).
	 * @param options.min Minimum allowed value (defaults to `Number.NEGATIVE_INFINITY`).
	 * @param options.max Maximum allowed value (defaults to `Number.POSITIVE_INFINITY`).
	 * @param options.step Rounding step the value is snapped to.
	 * @param options.format Function used to render the number for display (defaults to `formatNumber`).
	 * @param options.value Default number value used when the input is `undefined`.
	 */
	constructor({
		one = "number",
		title = "Number",
		min = Number.NEGATIVE_INFINITY,
		max = Number.POSITIVE_INFINITY,
		step,
		format = formatNumber,
		value,
		...options
	}: NumberSchemaOptions) {
		super({ one, title, value, ...options });
		this.min = min;
		this.max = max;
		this.step = step;
	}
	/**
	 * Validate an unknown value and coerce it to a number.
	 *
	 * @param value Value to validate (defaults to this schema's `value`).
	 * @returns The coerced (and optionally stepped) number value.
	 * @throws `string` `"Required"` if the value is empty or missing, `` `Must be ${one}` `` if it cannot be coerced to a number, `` `Minimum ${min}` `` if below `min`, or `` `Maximum ${max}` `` if above `max`.
	 *
	 * @example
	 *  NUMBER.validate("42"); // Returns 42
	 *
	 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NumberSchema/validate
	 */
	override validate(value: unknown = this.value): number {
		const number = getNumber(value);
		if (typeof number !== "number") throw value ? `Must be ${this.one}` : "Required";
		const stepped = typeof this.step === "number" ? roundStep(number, this.step) : number;
		if (stepped < this.min) throw !number ? "Required" : `Minimum ${this.format(this.min)}`;
		if (stepped > this.max) throw `Maximum ${this.format(this.max)}`;
		return stepped;
	}
	/**
	 * Format a number value as a human-readable string for display.
	 *
	 * @param value Number value to format.
	 * @returns The formatted string.
	 *
	 * @example
	 *  NUMBER.format(2048.5); // Returns "2,048.5"
	 *
	 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NumberSchema/format
	 */
	override format(value: number): string {
		return formatNumber(value);
	}
}

/**
 * Valid number, e.g. `2048.12345` or `0` zero and a default value of zero.
 *
 * @example
 *  NUMBER.validate("42"); // Returns 42
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NUMBER
 */
export const NUMBER = new NumberSchema({ title: "Number" });

/**
 * Valid optional number, e.g. `2048.12345` or `0` zero, or `null`.
 *
 * @example
 *  NULLABLE_NUMBER.validate(null); // Returns null
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NULLABLE_NUMBER
 */
export const NULLABLE_NUMBER = NULLABLE(NUMBER);

/**
 * Valid integer number, e.g. `2048` or `0` zero.
 *
 * @example
 *  INTEGER.validate("42.7"); // Returns 43 (rounded to step)
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/INTEGER
 */
export const INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER });

/**
 * Valid positive integer number, e.g. `1,2,3` (not including zero).
 *
 * @example
 *  POSITIVE_INTEGER.validate(0); // Throws "Required"
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/POSITIVE_INTEGER
 */
export const POSITIVE_INTEGER = new NumberSchema({ step: 1, min: 1, max: Number.MAX_SAFE_INTEGER });

/**
 * Valid non-negative integer number, e.g. `0,1,2,3` (including zero).
 *
 * @example
 *  NON_NEGATIVE_INTEGER.validate(0); // Returns 0
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NON_NEGATIVE_INTEGER
 */
export const NON_NEGATIVE_INTEGER = new NumberSchema({ step: 1, min: 0, max: Number.MAX_SAFE_INTEGER });

/**
 * Valid negative integer number, e.g. `-1,-2,-3` (not including zero).
 *
 * @example
 *  NEGATIVE_INTEGER.validate(-3); // Returns -3
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NEGATIVE_INTEGER
 */
export const NEGATIVE_INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: -1 });

/**
 * Valid non-positive integer number, e.g. `0,-1,-2,-3` (including zero).
 *
 * @example
 *  NON_POSITIVE_INTEGER.validate(0); // Returns 0
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NON_POSITIVE_INTEGER
 */
export const NON_POSITIVE_INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: 0 });

/**
 * Valid optional integer number, e.g. `2048` or `0` zero, or `null`.
 *
 * @example
 *  NULLABLE_INTEGER.validate(null); // Returns null
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NULLABLE_INTEGER
 */
export const NULLABLE_INTEGER = NULLABLE(INTEGER);

/**
 * Valid Unix timestamp (including milliseconds).
 *
 * @example
 *  TIMESTAMP.validate(1700000000000); // Returns 1700000000000
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/TIMESTAMP
 */
export const TIMESTAMP = new NumberSchema({
	title: "Timestamp",
	step: 1,
	min: Number.MIN_SAFE_INTEGER,
	max: Number.MAX_SAFE_INTEGER,
});

/**
 * Valid optional Unix timestamp (including milliseconds), or `null`.
 *
 * @example
 *  NULLABLE_TIMESTAMP.validate(null); // Returns null
 *
 * @see https://dhoulb.github.io/shelving/schema/NumberSchema/NULLABLE_TIMESTAMP
 */
export const NULLABLE_TIMESTAMP = NULLABLE_INTEGER;
