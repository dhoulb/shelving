import { formatDate, getOptionalDate, getYMD, PossibleDate, PossibleOptionalDate } from "../util/date.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { Schema, SchemaOptions } from "./Schema.js";
import { OPTIONAL } from "./OptionalSchema.js";

/** Allowed options for `DateSchema` */
export type DateSchemaOptions = SchemaOptions & {
	readonly value?: PossibleDate | undefined;
	readonly min?: PossibleOptionalDate | undefined;
	readonly max?: PossibleOptionalDate | undefined;
};

/** Define a valid date in YMD format, e.g. `2005-09-12` */
export class DateSchema extends Schema<string> {
	override readonly value: PossibleDate;
	readonly min: Date | null;
	readonly max: Date | null;
	constructor({ value = "now", min = null, max = null, ...options }: DateSchemaOptions) {
		super(options);
		this.value = value;
		this.min = getOptionalDate(min);
		this.max = getOptionalDate(max);
	}
	override validate(unsafeValue: unknown = this.value): string {
		const date = getOptionalDate(unsafeValue);
		if (!date) throw new InvalidFeedback(unsafeValue ? "Invalid date" : "Required", { value: unsafeValue });
		if (this.min && date < this.min) throw new InvalidFeedback(`Minimum ${formatDate(this.min)}`, { value: date });
		if (this.max && date > this.max) throw new InvalidFeedback(`Maximum ${formatDate(this.max)}`, { value: date });
		return getYMD(date);
	}
}

/** Valid date, e.g. `2005-09-12` (required because falsy values are invalid). */
export const DATE = new DateSchema({});

/** Valid date, e.g. `2005-09-12`, or `null` */
export const OPTIONAL_DATE = OPTIONAL(DATE);
