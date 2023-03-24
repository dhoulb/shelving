import { formatNumber, getOptionalNumber, roundStep } from "../util/number.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { Schema, SchemaOptions } from "./Schema.js";
import { OPTIONAL } from "./OptionalSchema.js";

/** Allowed options for `NumberSchema` */
export type NumberSchemaOptions = SchemaOptions & {
	readonly value?: number | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
	readonly step?: number | null | undefined;
};

/** Schema that defines a valid number. */
export class NumberSchema extends Schema<number> {
	override readonly value: number;
	readonly min: number;
	readonly max: number;
	readonly step: number | null;
	constructor({ value = 0, min = -Infinity, max = Infinity, step = null, ...rest }: NumberSchemaOptions) {
		super(rest);
		this.value = value;
		this.min = min;
		this.max = max;
		this.step = step;
	}
	override validate(unsafeValue: unknown = this.value): number {
		const unsafeNumber = getOptionalNumber(unsafeValue);
		if (typeof unsafeNumber !== "number") throw new InvalidFeedback("Must be number", { value: unsafeValue });
		const safeNumber = typeof this.step === "number" ? roundStep(unsafeNumber, this.step) : unsafeNumber;
		if (safeNumber > this.max) throw new InvalidFeedback(`Maximum ${formatNumber(this.max)}`, { value: safeNumber });
		if (safeNumber < this.min) throw new InvalidFeedback(`Minimum ${formatNumber(this.min)}`, { value: safeNumber });
		return safeNumber;
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
export const TIMESTAMP = INTEGER;

/** Valid Unix timestamp (including milliseconds). */
export const OPTIONAL_TIMESTAMP = OPTIONAL_INTEGER;
