import { getOptionalDate, getYmd, PossibleDate } from "../util/date.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { Schema, SchemaOptions } from "./Schema.js";
import { OPTIONAL } from "./OptionalSchema.js";

/** Define a valid date, e.g. `2005-09-12` */
export class DateSchema extends Schema<string> {
	override readonly value: PossibleDate;
	readonly min: PossibleDate | null;
	readonly max: PossibleDate | null;
	constructor({
		value = "now",
		min = null,
		max = null,
		...options
	}: SchemaOptions & {
		readonly value?: PossibleDate;
		readonly min?: PossibleDate | null;
		readonly max?: PossibleDate | null;
	}) {
		super(options);
		this.value = value;
		this.min = min;
		this.max = max;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const date = getOptionalDate(unsafeValue);
		if (!date) throw new InvalidFeedback(unsafeValue ? "Invalid date" : "Required", { value: unsafeValue });
		const minDate = getOptionalDate(this.min);
		if (minDate && date.getTime() < minDate.getTime()) throw new InvalidFeedback(`Minimum ${minDate.toLocaleDateString()}`, { value: date });
		const maxDate = getOptionalDate(this.max);
		if (maxDate && date.getTime() > maxDate.getTime()) throw new InvalidFeedback(`Maximum ${maxDate.toLocaleDateString()}`, { value: date });
		return getYmd(date);
	}
}

/** Valid date, e.g. `2005-09-12` (required because falsy values are invalid). */
export const DATE = new DateSchema({});

/** Valid date, e.g. `2005-09-12`, or `null` */
export const OPTIONAL_DATE = OPTIONAL(DATE);
