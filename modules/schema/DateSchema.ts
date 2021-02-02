import { InvalidFeedback } from "../feedback";
import { toDate, getYmd, PossibleOptionalDate } from "../date";
import { RequiredOptions, Schema, SchemaOptions } from "./Schema";

export type DateOptions = SchemaOptions & {
	readonly required?: boolean;
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
	readonly value: PossibleOptionalDate;
	readonly min: PossibleOptionalDate;
	readonly max: PossibleOptionalDate;

	constructor({ value = null, min = null, max = null, ...rest }: DateOptions) {
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
			if (unsafeValue) throw new InvalidFeedback("Invalid date");

			// Check requiredness.
			if (this.required) throw new InvalidFeedback("Required");

			// Return null.
			// We know this type assertion is sound because `null` can never be returned if `this.required == true`.
			return null as T;
		}

		// Enforce min/max.
		const minDate = toDate(this.min);
		if (minDate && value.getTime() < minDate.getTime()) throw new InvalidFeedback(`Minimum ${minDate.toLocaleDateString()}`);
		const maxDate = toDate(this.max);
		if (maxDate && value.getTime() > maxDate.getTime()) throw new InvalidFeedback(`Maximum ${maxDate.toLocaleDateString()}`);

		// Return the valid date string.
		return getYmd(value) as T;
	}
}

/** Shortcuts for DateSchema. */
export const date: {
	(options: DateOptions & RequiredOptions): DateSchema<string>;
	(options: DateOptions): DateSchema<string | null>;
	required: DateSchema<string>;
	optional: DateSchema<string | null>;
} = Object.assign(<T extends string | null>(options: DateOptions): DateSchema<T> => new DateSchema<T>(options), {
	required: new DateSchema<string>({ required: true, value: "now" }),
	optional: new DateSchema<string | null>({ required: false }),
});
