import { InvalidFeedback } from "../feedback";
import { toNumber, roundNumber } from "../number";
import { isArray } from "../array";
import { isObject } from "../object";
import { Unit, detectUnit, convertUnits } from "../units";
import { RequiredOptions, Schema, SchemaOptions } from "./Schema";

export type NumberOptions<T extends number | null> = SchemaOptions & {
	readonly value?: number | null;
	readonly unit?: Unit | null;
	readonly required?: boolean;
	readonly min?: number | null;
	readonly max?: number | null;
	readonly step?: number | null;
	readonly options?: (T extends number ? ReadonlyArray<T> | { readonly [K in T]: string } : never) | null;
};

export type NumberOptionOptions<T extends number> = {
	readonly options: ReadonlyArray<T> | { readonly [K in T]: string };
};

/**
 * Schema that defines a valid number.
 * Ensures/converts value to number, enforces min/max number, and precision.
 */
export class NumberSchema<T extends number | null> extends Schema<T> {
	readonly value: number | null;
	readonly unit?: Unit | null;
	readonly min: number | null;
	readonly max: number | null;
	readonly step: number | null;
	readonly options: (T extends number ? ReadonlyArray<T> | { readonly [K in T]: string } : never) | null;

	constructor({ value = null, unit = null, min = null, max = null, step = null, options = null, ...rest }: NumberOptions<T>) {
		super(rest);
		this.value = value;
		this.unit = unit;
		this.min = min;
		this.max = max;
		this.step = step;
		this.options = options;
	}

	validate(unsafeValue: unknown = this.value): T {
		// Coorce.
		let value = toNumber(unsafeValue);

		// Null means 'no number'
		if (value === null) {
			// If original input was truthy, we know its format must have been wrong.
			if (unsafeValue) throw new InvalidFeedback("Must be number");

			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required");

			// Return null.
			// We know this type assertion is sound because `null` can never be returned if `this.required == true`.
			return null as T;
		}

		// Convert units, e.g. `10km` into the target dimension.
		if (this.unit && typeof value === "number" && typeof unsafeValue === "string") {
			const detectedUnit = detectUnit(unsafeValue, this.unit);
			if (!detectedUnit) throw new InvalidFeedback("Invalid distance");
			if (detectedUnit !== this.unit) value = convertUnits(value, detectedUnit, this.unit);
		}

		// Check min and max.
		if (typeof this.max === "number" && value > this.max) throw new InvalidFeedback(`Maximum ${this.max}`);
		if (typeof this.min === "number" && value < this.min) throw new InvalidFeedback(`Minimum ${this.min}`);

		// Round to step.
		if (typeof this.step === "number") value = roundNumber(value, this.step);

		// Check options format.
		if (isArray(this.options)) {
			if (!this.options.includes(value)) throw new InvalidFeedback("Unknown value");
		} else if (isObject(this.options)) {
			if (!Object.keys(this.options).includes(value.toString())) throw new InvalidFeedback("Unknown value");
		}

		// Return number.
		return value as T;
	}
}

/** Shortcuts for NumberSchema. */
export const number: {
	<T extends number>(options: NumberOptions<T> & NumberOptionOptions<T> & RequiredOptions): NumberSchema<T>;
	<T extends number>(options: NumberOptions<T> & NumberOptionOptions<T>): NumberSchema<T | null>;
	(options: NumberOptions<number | null> & RequiredOptions): NumberSchema<number>;
	(options: NumberOptions<number | null>): NumberSchema<number | null>;
	required: NumberSchema<number>;
	optional: NumberSchema<number | null>;
	/** An number representing a valid Unix timestamp in milliseconds, e.g. as returned by `Date.now()` */
	timestamp: NumberSchema<number>;
} = Object.assign(<T extends number | null>(options: NumberOptions<T>): NumberSchema<T> => new NumberSchema<T>(options), {
	required: new NumberSchema<number>({ required: true, value: 0 }),
	optional: new NumberSchema<number | null>({ required: false }),
	timestamp: new NumberSchema<number>({ required: true, min: -62167219125000, max: 253370764800000 }), // Limited to four-digit years: 0000–9999
});
