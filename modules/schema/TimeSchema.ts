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
 * @see https://shelving.cc/schema/TimeSchema
 */
export class TimeSchema extends DateSchema {
	constructor({ one = "time", title = "Time", input = "time", ...options }: DateSchemaOptions) {
		super({ one, title, input, ...options });
	}
	/** Stringifies as a `hh:mm:ss.fff` time string. */
	override stringify(value: Date): string {
		return requireTimeString(value);
	}
	/** Formats the time string for display via `formatTime()`. */
	override format(value: string): string {
		return formatTime(value, undefined, this.format);
	}
}

/**
 * Sugar instance of `TimeSchema` for a required abstract time. Equivalent to `new TimeSchema({})`.
 *
 * @example TIME.validate("23:59") // "23:59:00.000"
 * @see https://shelving.cc/schema/TIME
 */
export const TIME = new TimeSchema({});

/**
 * Sugar instance allowing a `TIME` or `null`. Equivalent to `NULLABLE(TIME)`.
 *
 * @example NULLABLE_TIME.validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_TIME
 */
export const NULLABLE_TIME = NULLABLE(TIME);
