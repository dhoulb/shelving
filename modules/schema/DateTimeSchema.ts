import { formatDateTime } from "../util/format.js";
import { DateSchema, type DateSchemaOptions } from "./DateSchema.js";
import { NULLABLE } from "./NullableSchema.js";

/**
 * Schema that defines a valid UTC datetime in ISO 8601 format, e.g. `2005-09-12T18:15:00.000Z`.
 *
 * - The date includes the `Z` suffix to indicate UTC time, this ensures consistent transfer of the date between client and server.
 * - If you wish to define an _abstract_ date without a timezone, e.g. a birthday or anniversary, use `DateSchema` instead.
 * - If you wish to define an _abstract_ time without a timezone, e.g. a daily alarm, use `TimeSchema` instead.
 *
 * @example
 *  const schema = new DateTimeSchema({});
 *  schema.validate("2005-09-12T18:15:00Z"); // "2005-09-12T18:15:00.000Z"
 * @see https://shelving.cc/schema/DateTimeSchema
 */
export class DateTimeSchema extends DateSchema {
	constructor({ one = "time", title = "Time", input = "datetime-local", ...options }: DateSchemaOptions) {
		super({ one, title, input, ...options });
	}
	/** Stringifies as an ISO 8601 UTC string with `Z` suffix. */
	override stringify(value: Date): string {
		return value.toISOString();
	}
	/** Formats the datetime string for display via `formatDateTime()`. */
	override format(value: string): string {
		return formatDateTime(value, undefined, this.format);
	}
}

/**
 * Sugar instance of `DateTimeSchema` for a required UTC datetime. Equivalent to `new DateTimeSchema({})`.
 *
 * @example DATETIME.validate("2005-09-12T08:00:00Z") // "2005-09-12T08:00:00.000Z"
 * @see https://shelving.cc/schema/DATETIME
 */
export const DATETIME = new DateTimeSchema({});

/**
 * Sugar instance allowing a `DATETIME` or `null`. Equivalent to `NULLABLE(DATETIME)`.
 *
 * @example NULLABLE_DATETIME.validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_DATETIME
 */
export const NULLABLE_DATETIME = NULLABLE(DATETIME);
