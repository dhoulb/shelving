import { requireTimeString } from "../util/date.js";
import { formatTime } from "../util/format.js";
import { DateSchema, type DateSchemaOptions } from "./DateSchema.js";
import { NULLABLE } from "./NullableSchema.js";

/** Define a valid time in 24h hh:mm:ss.fff format, e.g. `23:59` or `24:00 */
export class TimeSchema extends DateSchema {
	constructor({ one = "time", title = "Time", input = "time", ...options }: DateSchemaOptions) {
		super({ one, title, input, ...options });
	}

	override stringify(value: Date): string {
		return requireTimeString(value);
	}

	override format(value: Date): string {
		return formatTime(value);
	}
}

/** Valid time, e.g. `2005-09-12` (required because falsy values are invalid). */
export const TIME = new TimeSchema({});

/** Valid time, e.g. `2005-09-12`, or `null` */
export const NULLABLE_TIME = NULLABLE(TIME);
