import { formatNumber } from "../util/format.js";
import { getNumber, roundStep } from "../util/number.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * Allowed options for `NumberSchema`.
 *
 * @see https://shelving.cc/schema/NumberSchemaOptions
 */
export interface NumberSchemaOptions extends SchemaOptions {
	/** Default number value used when the input is `undefined`. */
	readonly value?: number | undefined;
	/**
	 * Minimum allowed value.
	 * @default Number.NEGATIVE_INFINITY
	 */
	readonly min?: number | undefined;
	/**
	 * Maximum allowed value.
	 * @default Number.POSITIVE_INFINITY
	 */
	readonly max?: number | undefined;
	/** Rounding step the value is snapped to (e.g. `1` for integers). */
	readonly step?: number | undefined;
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
 * @see https://shelving.cc/schema/NumberSchema
 */
export class NumberSchema extends Schema<number> {
	declare readonly value: number | undefined;
	readonly min: number;
	readonly max: number;
	readonly step: number | undefined;
	/**
	 * Create a new `NumberSchema`.
	 */
	constructor({
		one = "number",
		title = "Number",
		min = Number.NEGATIVE_INFINITY,
		max = Number.POSITIVE_INFINITY,
		step,
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
	 * @see https://shelving.cc/schema/NumberSchema/validate
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
	 * @see https://shelving.cc/schema/NumberSchema/format
	 */
	override format(value: number): string {
		return formatNumber(value);
	}
}

/**
 * Sugar instance of `NumberSchema` for an unconstrained number. Equivalent to `new NumberSchema({ title: "Number" })`.
 *
 * @example
 *  NUMBER.validate("42"); // Returns 42
 *
 * @see https://shelving.cc/schema/NUMBER
 */
export const NUMBER = new NumberSchema({ title: "Number" });

/**
 * Sugar instance allowing a `NUMBER` or `null`. Equivalent to `NULLABLE(NUMBER)`.
 *
 * @example
 *  NULLABLE_NUMBER.validate(null); // Returns null
 *
 * @see https://shelving.cc/schema/NULLABLE_NUMBER
 */
export const NULLABLE_NUMBER = NULLABLE(NUMBER);

/**
 * Sugar instance of `NumberSchema` for an integer. Equivalent to `new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER })`.
 *
 * @example
 *  INTEGER.validate("42.7"); // Returns 43 (rounded to step)
 *
 * @see https://shelving.cc/schema/INTEGER
 */
export const INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER });

/**
 * Sugar instance of `NumberSchema` for a positive integer (excluding zero). Equivalent to `new NumberSchema({ step: 1, min: 1, max: Number.MAX_SAFE_INTEGER })`.
 *
 * @example
 *  POSITIVE_INTEGER.validate(0); // Throws "Required"
 *
 * @see https://shelving.cc/schema/POSITIVE_INTEGER
 */
export const POSITIVE_INTEGER = new NumberSchema({ step: 1, min: 1, max: Number.MAX_SAFE_INTEGER });

/**
 * Sugar instance of `NumberSchema` for a non-negative integer (including zero). Equivalent to `new NumberSchema({ step: 1, min: 0, max: Number.MAX_SAFE_INTEGER })`.
 *
 * @example
 *  NON_NEGATIVE_INTEGER.validate(0); // Returns 0
 *
 * @see https://shelving.cc/schema/NON_NEGATIVE_INTEGER
 */
export const NON_NEGATIVE_INTEGER = new NumberSchema({ step: 1, min: 0, max: Number.MAX_SAFE_INTEGER });

/**
 * Sugar instance of `NumberSchema` for a negative integer (excluding zero). Equivalent to `new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: -1 })`.
 *
 * @example
 *  NEGATIVE_INTEGER.validate(-3); // Returns -3
 *
 * @see https://shelving.cc/schema/NEGATIVE_INTEGER
 */
export const NEGATIVE_INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: -1 });

/**
 * Sugar instance of `NumberSchema` for a non-positive integer (including zero). Equivalent to `new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: 0 })`.
 *
 * @example
 *  NON_POSITIVE_INTEGER.validate(0); // Returns 0
 *
 * @see https://shelving.cc/schema/NON_POSITIVE_INTEGER
 */
export const NON_POSITIVE_INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: 0 });

/**
 * Sugar instance allowing an `INTEGER` or `null`. Equivalent to `NULLABLE(INTEGER)`.
 *
 * @example
 *  NULLABLE_INTEGER.validate(null); // Returns null
 *
 * @see https://shelving.cc/schema/NULLABLE_INTEGER
 */
export const NULLABLE_INTEGER = NULLABLE(INTEGER);

/**
 * Sugar instance of `NumberSchema` for a Unix timestamp (including milliseconds). Equivalent to `new NumberSchema({ title: "Timestamp", step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER })`.
 *
 * @example
 *  TIMESTAMP.validate(1700000000000); // Returns 1700000000000
 *
 * @see https://shelving.cc/schema/TIMESTAMP
 */
export const TIMESTAMP = new NumberSchema({
	title: "Timestamp",
	step: 1,
	min: Number.MIN_SAFE_INTEGER,
	max: Number.MAX_SAFE_INTEGER,
});

/**
 * Sugar instance — alias of `NULLABLE_INTEGER`. Equivalent to `NULLABLE_INTEGER`.
 *
 * @example
 *  NULLABLE_TIMESTAMP.validate(null); // Returns null
 *
 * @see https://shelving.cc/schema/NULLABLE_TIMESTAMP
 */
export const NULLABLE_TIMESTAMP = NULLABLE_INTEGER;
