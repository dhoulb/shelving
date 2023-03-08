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

/** Valid number, e.g. `2048.12345` or `0` zero, or `null` */
export const OPTIONAL_NUMBER = OPTIONAL(NUMBER);

/** Valid integer number, e.g. `2048` or `0` zero. */
export const INTEGER = new NumberSchema({ step: 1, min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER });

/** Valid integer number, e.g. `2048` or `0` zero, or `null` */
export const OPTIONAL_INTEGER = OPTIONAL(INTEGER);
