import type { SchemaOptions } from "./Schema.js";
import type { PossibleDate } from "../util/date.js";
import type { Optional } from "../util/optional.js";
import { ValueFeedback } from "../feedback/Feedback.js";
import { formatDate, getOptionalDate, getYMD } from "../util/date.js";
import { OPTIONAL } from "./OptionalSchema.js";
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
		this.min = getOptionalDate(min);
		this.max = getOptionalDate(max);
	}
	override validate(unsafeValue: unknown = this.value): string {
		const optionalDate = getOptionalDate(unsafeValue);
		if (!optionalDate) throw new ValueFeedback(unsafeValue ? "Invalid date" : "Required", unsafeValue);
		if (this.min && optionalDate < this.min) throw new ValueFeedback(`Minimum ${formatDate(this.min)}`, optionalDate);
		if (this.max && optionalDate > this.max) throw new ValueFeedback(`Maximum ${formatDate(this.max)}`, optionalDate);
		return getYMD(optionalDate);
	}
}

/** Valid date, e.g. `2005-09-12` (required because falsy values are invalid). */
export const DATE = new DateSchema({});

/** Valid date, e.g. `2005-09-12`, or `null` */
export const OPTIONAL_DATE = OPTIONAL(DATE);
