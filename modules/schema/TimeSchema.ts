import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { PossibleTime, getOptionalTime } from "../util/time.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { Schema, SchemaOptions } from "./Schema.js";

/** Define a valid time in 24h hh:mm:ss.fff format, e.g. `23:59` or `24:00 */
export class TimeSchema extends Schema<string> {
	override readonly value: PossibleTime;
	constructor({
		value = "now",
		...options
	}: SchemaOptions & {
		readonly value?: PossibleTime;
	}) {
		super(options);
		this.value = value;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const time = getOptionalTime(unsafeValue);
		if (!time) throw new InvalidFeedback(unsafeValue ? "Invalid time" : "Required", { value: unsafeValue });
		return time.long;
	}
}

/** Valid time, e.g. `2005-09-12` (required because falsy values are invalid). */
export const TIME = new TimeSchema({});

/** Valid time, e.g. `2005-09-12`, or `null` */
export const OPTIONAL_TIME = OPTIONAL(TIME);
