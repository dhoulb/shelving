import { formatDateTime } from "../util/format.js";
import { DateSchema, type DateSchemaOptions } from "./DateSchema.js";
import { NULLABLE } from "./NullableSchema.js";

/** Allowed options for `DateSchema` */
export interface DateTimeSchemaOptions extends DateSchemaOptions {}

/** Define a valid date in ISO 8601 format, e.g. `2005-09-12T18:15:00.000Z` */
export class DateTimeSchema extends DateSchema {
	override format(value: Date): string {
		return formatDateTime(value);
	}
	override stringify(value: Date): string {
		return value.toISOString();
	}
}

/** Valid datetime, e.g. `2005-09-12T08:00:00Z` (required because falsy values are invalid). */
export const DATETIME = new DateTimeSchema({});

/** Valid datetime, e.g. `2005-09-12T21:30:00Z`, or `null` */
export const NULLABLE_DATETIME = NULLABLE(DATETIME);
