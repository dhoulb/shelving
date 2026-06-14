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
 * @see https://dhoulb.github.io/shelving/schema/DateTimeSchema/DateTimeSchema
 */
export class DateTimeSchema extends DateSchema {
	/**
	 * Create a new `DateTimeSchema`.
	 *
	 * @param options Options for the schema (same as `DateSchemaOptions`).
	 */
	constructor({ one = "time", title = "Time", input = "datetime-local", ...options }: DateSchemaOptions) {
		super({ one, title, input, ...options });
	}
	/**
	 * Convert a `Date` object to an ISO 8601 UTC string.
	 *
	 * @param value The `Date` to convert.
	 * @returns The datetime as an ISO 8601 string with `Z` suffix.
	 * @example schema.stringify(new Date("2005-09-12T18:15:00Z")) // "2005-09-12T18:15:00.000Z"
	 * @see https://dhoulb.github.io/shelving/schema/DateTimeSchema/DateTimeSchema/stringify
	 */
	override stringify(value: Date): string {
		return value.toISOString();
	}
	/**
	 * Format a validated datetime string as a human-readable string for display.
	 *
	 * @param value The validated datetime string to format.
	 * @returns The datetime formatted for display.
	 * @example schema.format("2005-09-12T18:15:00Z") // "12 Sep 2005, 18:15"
	 * @see https://dhoulb.github.io/shelving/schema/DateTimeSchema/DateTimeSchema/format
	 */
	override format(value: string): string {
		return formatDateTime(value, undefined, this.format);
	}
}

/**
 * Valid datetime, e.g. `2005-09-12T08:00:00Z` (required because falsy values are invalid).
 *
 * @example DATETIME.validate("2005-09-12T08:00:00Z") // "2005-09-12T08:00:00.000Z"
 * @see https://dhoulb.github.io/shelving/schema/DateTimeSchema/DATETIME
 */
export const DATETIME = new DateTimeSchema({});

/**
 * Valid datetime, e.g. `2005-09-12T21:30:00Z`, or `null`.
 *
 * @example NULLABLE_DATETIME.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/DateTimeSchema/NULLABLE_DATETIME
 */
export const NULLABLE_DATETIME = NULLABLE(DATETIME);
