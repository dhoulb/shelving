import { InvalidFeedback } from "../feedback";
import { toDate, getYmd, PossibleOptionalDate } from "../date";
import { RequiredSchemaOptions, Schema, SchemaOptions } from "./Schema";

type DateOptions<T extends string | null> = SchemaOptions<T> & {
	readonly value?: PossibleOptionalDate;
	readonly min?: PossibleOptionalDate;
	readonly max?: PossibleOptionalDate;
};

/**
 * Schema that defines a valid date in string YMD format, e.g. `2019-10-04`
 * - `Date` instances, numbers, strings, are automatically converted to YMD strings.
 * - `null` is also a valid value if this field is not required.
 */
export class DateSchema<T extends string | null> extends Schema<T> {
	static create<X extends string>(options: DateOptions<X> & RequiredSchemaOptions): DateSchema<X>;
	static create<X extends string | null>(options: DateOptions<X>): DateSchema<X | null>;
	static create(options: DateOptions<string | null>): DateSchema<string | null> {
		return new DateSchema(options);
	}

	readonly value: PossibleOptionalDate;
	readonly min: PossibleOptionalDate;
	readonly max: PossibleOptionalDate;

	protected constructor({ value = null, min = null, max = null, ...rest }: DateOptions<T>) {
		super(rest);
		this.value = value;
		this.min = min;
		this.max = max;
	}

	validate(unsafeValue: unknown = this.value): T {
		// Coorce.
		const value = toDate(unsafeValue);

		// Explicit null means 'no date'.
		if (value === null) {
			// If original input was truthy, we know its format must have been wrong.
			if (unsafeValue) throw new InvalidFeedback("Invalid date", { value: unsafeValue });

			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required", { value: unsafeValue });

			// Return null.
			return super.validate(null);
		}

		// Enforce min/max.
		const minDate = toDate(this.min);
		if (minDate && value.getTime() < minDate.getTime()) throw new InvalidFeedback(`Minimum ${minDate.toLocaleDateString()}`, { value });
		const maxDate = toDate(this.max);
		if (maxDate && value.getTime() > maxDate.getTime()) throw new InvalidFeedback(`Maximum ${maxDate.toLocaleDateString()}`, { value });

		// Return date string.
		return super.validate(getYmd(value));
	}
}
