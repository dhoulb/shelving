import type { PossibleDate } from "../util/date.js";
import { getDate, requireDateString } from "../util/date.js";
import { formatDate } from "../util/format.js";
import type { Nullish } from "../util/null.js";
import { roundStep } from "../util/number.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/**
 * `type=""` prop for HTML `<input />` tags that are relevant for dates.
 *
 * @see https://shelving.cc/schema/DateInputType
 */
export type DateInputType = "time" | "date" | "datetime-local";

/**
 * Options for `DateSchema`.
 *
 * @see https://shelving.cc/schema/DateSchemaOptions
 */
export interface DateSchemaOptions extends SchemaOptions {
	/** Default date used when the input is `undefined`. */
	readonly value?: PossibleDate | undefined;
	/** Earliest allowed date (`null` for no bound). */
	readonly min?: Nullish<PossibleDate>;
	/** Latest allowed date (`null` for no bound). */
	readonly max?: Nullish<PossibleDate>;
	/**
	 * HTML `<input />` `type=""` hint for downstream UIs.
	 * @default "date"
	 */
	readonly input?: DateInputType | undefined;
	/**
	 * Rounding step (in milliseconds, because that's the base unit for time).
	 * - E.g. `1000 * 60` will round to the nearest minute.
	 * - Note: HTML `<input>` `step` attributes are in _seconds_, so you may need to convert units.
	 */
	readonly step?: number | undefined;
}

/**
 * Schema that defines a valid date stored as a `YYYY-MM-DD` string, e.g. `2005-09-12`.
 *
 * - Validates an abstract date without a timezone; use `DateTimeSchema` for UTC datetimes and `TimeSchema` for times.
 * - The input is coerced to a `Date`, optionally rounded to `step`, range-checked against `min`/`max`, then stringified.
 *
 * @example
 *  const schema = new DateSchema({ min: "2000-01-01" });
 *  schema.validate("2005-09-12"); // "2005-09-12"
 * @see https://shelving.cc/schema/DateSchema
 */
export class DateSchema extends Schema<string> {
	/** Default date used when `validate()` is called with an `undefined` value. */
	declare readonly value: PossibleDate | undefined;
	/** Earliest allowed date, or `undefined` for no minimum. */
	readonly min: Date | undefined;
	/** Latest allowed date, or `undefined` for no maximum. */
	readonly max: Date | undefined;
	/** HTML `<input />` `type=""` hint for downstream UIs. */
	readonly input: DateInputType;
	/** Rounding step in milliseconds, or `undefined` for no rounding. */
	readonly step: number | undefined;

	constructor({ one = "date", min, max, value, input = "date", step, ...options }: DateSchemaOptions) {
		super({ one, title: "Date", value, ...options });
		this.min = getDate(min);
		this.max = getDate(max);
		this.input = input;
		this.step = step;
	}

	/** Coerces to a `Date`, optionally rounds to `step`, range-checks against `min` / `max`, then stringifies. */
	override validate(value: unknown = this.value): string {
		const date = getDate(value);
		if (!date) throw value ? `Invalid ${this.one} format` : "Required";

		const stepped = typeof this.step === "number" ? new Date(roundStep(date.getTime(), this.step)) : date;

		if (this.min && stepped < this.min) throw `Minimum ${this.format(this.stringify(this.min))}`;
		if (this.max && stepped > this.max) throw `Maximum ${this.format(this.stringify(this.max))}`;

		return this.stringify(stepped);
	}

	/**
	 * Convert a `Date` object to the string representation used by this schema.
	 *
	 * @param value The `Date` to convert.
	 * @returns The date as a `YYYY-MM-DD` string.
	 * @example schema.stringify(new Date("2005-09-12")) // "2005-09-12"
	 * @see https://shelving.cc/schema/DateSchema/stringify
	 */
	stringify(value: Date): string {
		return requireDateString(value);
	}

	/** Formats the date string for display via `formatDate()` (e.g. `"12 Sep 2005"`). */
	override format(value: string): string {
		return formatDate(value, undefined, this.format);
	}
}

/**
 * Sugar instance of `DateSchema` for a required date. Equivalent to `new DateSchema({})`.
 *
 * @example DATE.validate("2005-09-12") // "2005-09-12"
 * @see https://shelving.cc/schema/DATE
 */
export const DATE = new DateSchema({});

/**
 * Sugar instance allowing a `DATE` or `null`. Equivalent to `NULLABLE(DATE)`.
 *
 * @example NULLABLE_DATE.validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_DATE
 */
export const NULLABLE_DATE = NULLABLE(DATE);
