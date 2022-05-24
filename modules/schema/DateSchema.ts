import { toDate, getYmd, PossibleDate } from "../util/index.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { Schema } from "./Schema.js";
import { OPTIONAL } from "./OptionalSchema.js";

/** Define a valid date, e.g. `2005-09-12` */
export class DateSchema extends Schema<string> {
	readonly value: PossibleDate;
	readonly min: PossibleDate | null;
	readonly max: PossibleDate | null;
	constructor({
		value = "now",
		min = null,
		max = null,
		...options
	}: ConstructorParameters<typeof Schema>[0] & {
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
		const date = toDate(unsafeValue);
		if (!date) throw new InvalidFeedback(unsafeValue ? "Invalid date" : "Required", { value: unsafeValue });
		const minDate = toDate(this.min);
		if (minDate && date.getTime() < minDate.getTime()) throw new InvalidFeedback(`Minimum ${minDate.toLocaleDateString()}`, { value: date });
		const maxDate = toDate(this.max);
		if (maxDate && date.getTime() > maxDate.getTime()) throw new InvalidFeedback(`Maximum ${maxDate.toLocaleDateString()}`, { value: date });
		return getYmd(date);
	}
}

/** Valid date, e.g. `2005-09-12` (required because falsy values are invalid). */
export const DATE = new DateSchema({});

/** Valid date, e.g. `2005-09-12`, or `null` */
export const OPTIONAL_DATE = OPTIONAL(DATE);
