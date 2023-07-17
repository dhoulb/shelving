import type { SchemaOptions } from "./Schema.js";
import { Feedback } from "../feedback/Feedback.js";
import { formatNumber, getOptionalNumber, roundStep } from "../util/number.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `NumberSchema` */
export type NumberSchemaOptions = SchemaOptions & {
	readonly value?: number | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
	readonly step?: number | null | undefined;
};

/** Schema that defines a valid number. */
export class NumberSchema extends Schema<number> {
	declare readonly value: number;
	readonly min: number;
	readonly max: number;
	readonly step: number | null;
	constructor(options: NumberSchemaOptions) {
		super({ title: "Number", value: 0, ...options });
		const { min = -Infinity, max = Infinity, step = null } = options;
		this.min = min;
		this.max = max;
		this.step = step;
	}
	override validate(unsafeValue: unknown = this.value): number {
		const optionalNumber = getOptionalNumber(unsafeValue);
		if (typeof optionalNumber !== "number") throw new Feedback("Must be number", unsafeValue);
		const roundedNumber = typeof this.step === "number" ? roundStep(optionalNumber, this.step) : optionalNumber;
		if (roundedNumber > this.max) throw new Feedback(`Maximum ${formatNumber(this.max)}`, roundedNumber);
		if (roundedNumber < this.min) throw new Feedback(`Minimum ${formatNumber(this.min)}`, roundedNumber);
		return roundedNumber;
	}
}

/** Valid number, e.g. `2048.12345` or `0` zero. */
export const NUMBER = new NumberSchema({});

/** Valid optional number, e.g. `2048.12345` or `0` zero, or `null` */
export const OPTIONAL_NUMBER = OPTIONAL(NUMBER);

/** Valid integer number, e.g. `2048` or `0` zero. */
export const INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER, value: 0 });

/** Valid positive integer number, e.g. `1,2,3` (not including zero). */
export const POSITIVE_INTEGER = new NumberSchema({ step: 1, min: 1, max: Number.MAX_SAFE_INTEGER, value: 1 });

/** Valid non-negative integer number, e.g. `0,1,2,3` (including zero). */
export const NON_NEGATIVE_INTEGER = new NumberSchema({ step: 1, min: 0, max: Number.MAX_SAFE_INTEGER, value: 0 });

/** Valid negative integer number, e.g. `-1,-2,-3` (not including zero). */
export const NEGATIVE_INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: -1, value: -1 });

/** Valid non-positive integer number, e.g. `0,-1,-2,-3` (including zero). */
export const NON_POSITIVE_INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: 0, value: 0 });

/** Valid optional integer number, e.g. `2048` or `0` zero, or `null` */
export const OPTIONAL_INTEGER = OPTIONAL(INTEGER);

/** Valid Unix timestamp (including milliseconds). */
export const TIMESTAMP = new NumberSchema({ title: "Timestamp", step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER, value: 0 });

/** Valid Unix timestamp (including milliseconds). */
export const OPTIONAL_TIMESTAMP = OPTIONAL_INTEGER;
