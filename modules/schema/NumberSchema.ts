import { InvalidFeedback } from "../feedback";
import { toNumber, roundNumber, isArray, isObject, Unit, detectUnit, convertUnits } from "../util";
import { RequiredSchemaOptions, Schema, SchemaOptions } from "./Schema";

type NumberSchemaOptions<T extends number | null> = SchemaOptions<T> & {
	readonly value?: number | null;
	readonly unit?: Unit | null;
	readonly min?: number | null;
	readonly max?: number | null;
	readonly step?: number | null;
	readonly options?: (T extends number ? ReadonlyArray<T> | { readonly [K in T]: string } : never) | null;
};

type NumberSchemaOptionOptions<T extends number> = {
	readonly options: ReadonlyArray<T> | { readonly [K in T]: string };
};

/**
 * Schema that defines a valid number.
 * Ensures/converts value to number, enforces min/max number, and precision.
 */
export class NumberSchema<T extends number | null> extends Schema<T> {
	static REQUIRED: NumberSchema<number> = new NumberSchema({ required: true });
	static OPTIONAL: NumberSchema<number | null> = new NumberSchema({ required: false });

	static create<X extends number>(options: NumberSchemaOptions<X> & NumberSchemaOptionOptions<X> & RequiredSchemaOptions): NumberSchema<X>;
	static create<X extends number>(options: NumberSchemaOptions<X> & NumberSchemaOptionOptions<X>): NumberSchema<X | null>;
	static create(options: NumberSchemaOptions<number | null> & RequiredSchemaOptions): NumberSchema<number>;
	static create(options: NumberSchemaOptions<number | null>): NumberSchema<number | null>;
	static create(options: NumberSchemaOptions<number | null>): NumberSchema<number | null> {
		return new NumberSchema(options);
	}

	readonly value: number | null;
	readonly unit?: Unit | null;
	readonly min: number | null;
	readonly max: number | null;
	readonly step: number | null;
	readonly options: (T extends number ? ReadonlyArray<T> | { readonly [K in T]: string } : never) | null;

	protected constructor({ value = null, unit = null, min = null, max = null, step = null, options = null, ...rest }: NumberSchemaOptions<T>) {
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
			if (unsafeValue) throw new InvalidFeedback("Must be number", { value: unsafeValue });

			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required", { value: unsafeValue });

			// Return null.
			return super.validate(null);
		}

		// Convert units, e.g. `10km` into the target dimension.
		if (this.unit && typeof value === "number" && typeof unsafeValue === "string") {
			const detectedUnit = detectUnit(unsafeValue, this.unit);
			if (!detectedUnit) throw new InvalidFeedback("Invalid unit", { value: unsafeValue });
			if (detectedUnit !== this.unit) value = convertUnits(value, detectedUnit, this.unit);
		}

		// Check min and max.
		if (typeof this.max === "number" && value > this.max) throw new InvalidFeedback(`Maximum ${this.max}`, { value });
		if (typeof this.min === "number" && value < this.min) throw new InvalidFeedback(`Minimum ${this.min}`, { value });

		// Round to step.
		if (typeof this.step === "number") value = roundNumber(value, this.step);

		// Check options format.
		if (isArray(this.options)) {
			if (!this.options.includes(value)) throw new InvalidFeedback("Unknown value", { value });
		} else if (isObject(this.options)) {
			if (!Object.keys(this.options).includes(value.toString())) throw new InvalidFeedback("Unknown value", { value });
		}

		// Return number.
		return super.validate(value);
	}
}
