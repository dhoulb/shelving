import { requireTimeString } from "../util/date.js";
import { formatTime } from "../util/format.js";
import { DateSchema, type DateSchemaOptions } from "./DateSchema.js";
import { NULLABLE } from "./NullableSchema.js";

/**
 * Schema that defines a valid abstract time in 24h `hh:mm:ss.fff` format, e.g. `23:59` or `24:00`.
 *
 * - Validates a time without a timezone, e.g. a daily alarm; use `DateSchema` for dates and `DateTimeSchema` for UTC datetimes.
 *
 * @example
 *  const schema = new TimeSchema({});
 *  schema.validate("23:59"); // "23:59:00.000"
 * @see https://dhoulb.github.io/shelving/schema/TimeSchema/TimeSchema
 */
export class TimeSchema extends DateSchema {
	/**
	 * Create a new `TimeSchema`.
	 *
	 * @param options Options for the schema (same as `DateSchemaOptions`).
	 */
	constructor({ one = "time", title = "Time", input = "time", ...options }: DateSchemaOptions) {
		super({ one, title, input, ...options });
	}
	/**
	 * Convert a `Date` object to a `hh:mm:ss.fff` time string.
	 *
	 * @param value The `Date` to convert.
	 * @returns The time portion as a `hh:mm:ss.fff` string.
	 * @example schema.stringify(new Date("2005-09-12T23:59:00Z")) // "23:59:00.000"
	 * @see https://dhoulb.github.io/shelving/schema/TimeSchema/TimeSchema/stringify
	 */
	override stringify(value: Date): string {
		return requireTimeString(value);
	}
	/**
	 * Format a validated time string as a human-readable string for display.
	 *
	 * @param value The validated time string to format.
	 * @returns The time formatted for display.
	 * @example schema.format("23:59") // "23:59"
	 * @see https://dhoulb.github.io/shelving/schema/TimeSchema/TimeSchema/format
	 */
	override format(value: string): string {
		return formatTime(value, undefined, this.format);
	}
}

/**
 * Sugar instance of [`TimeSchema`](/schema/TimeSchema) for a required abstract time. Equivalent to `new TimeSchema({})`.
 *
 * @example TIME.validate("23:59") // "23:59:00.000"
 * @see https://dhoulb.github.io/shelving/schema/TimeSchema/TIME
 */
export const TIME = new TimeSchema({});

/**
 * Sugar instance allowing a [`TIME`](/schema/TIME) or `null`. Equivalent to `NULLABLE(TIME)`.
 *
 * @example NULLABLE_TIME.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/TimeSchema/NULLABLE_TIME
 */
export const NULLABLE_TIME = NULLABLE(TIME);
