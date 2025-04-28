import { ValueFeedback } from "../feedback/Feedback.js";
import type { PossibleDate } from "../util/date.js";
import { formatDate, getDate, requireYMD } from "../util/date.js";
import type { Optional } from "../util/optional.js";
import { OPTIONAL } from "./OptionalSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `DateSchema` */
export interface DateSchemaOptions extends SchemaOptions {
	readonly value?: PossibleDate | undefined;
	readonly min?: Optional<PossibleDate> | undefined;
	readonly max?: Optional<PossibleDate> | undefined;
}

/** Define a valid date in YMD format, e.g. `2005-09-12` */
export class DateSchema extends Schema<string> {
	declare readonly value: PossibleDate;
	readonly min: Date | undefined;
	readonly max: Date | undefined;
	constructor({ min, max, title = "Date", value = "now", ...options }: DateSchemaOptions) {
		super({ title, value, ...options });
		this.min = getDate(min);
		this.max = getDate(max);
	}
	override validate(value: unknown = this.value): string {
		const date = getDate(value);
		if (!date) throw new ValueFeedback(value ? "Invalid date" : "Required", value);
		if (this.min && date < this.min) throw new ValueFeedback(`Minimum ${formatDate(this.min)}`, date);
		if (this.max && date > this.max) throw new ValueFeedback(`Maximum ${formatDate(this.max)}`, date);
		return requireYMD(date);
	}
}

/** Valid date, e.g. `2005-09-12` (required because falsy values are invalid). */
export const DATE = new DateSchema({});

/** Valid date, e.g. `2005-09-12`, or `null` */
export const OPTIONAL_DATE = OPTIONAL(DATE);
