import type { SchemaOptions } from "./Schema.js";
import type { PossibleDate } from "../util/date.js";
import type { Optional } from "../util/optional.js";
import { Feedback } from "../feedback/Feedback.js";
import { formatDate, getOptionalDate, getYMD } from "../util/date.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `DateSchema` */
export type DateSchemaOptions = SchemaOptions & {
	readonly value?: PossibleDate | undefined;
	readonly min?: Optional<PossibleDate> | undefined;
	readonly max?: Optional<PossibleDate> | undefined;
};

/** Define a valid date in YMD format, e.g. `2005-09-12` */
export class DateSchema extends Schema<string> {
	declare readonly value: PossibleDate;
	readonly min: Date | undefined;
	readonly max: Date | undefined;
	constructor(options: DateSchemaOptions) {
		super({ title: "Date", value: "now", ...options });
		const { min = null, max = null } = options;
		this.min = getOptionalDate(min);
		this.max = getOptionalDate(max);
	}
	override validate(unsafeValue: unknown = this.value): string {
		const optionalDate = getOptionalDate(unsafeValue);
		if (!optionalDate) throw new Feedback(unsafeValue ? "Invalid date" : "Required", unsafeValue);
		if (this.min && optionalDate < this.min) throw new Feedback(`Minimum ${formatDate(this.min)}`, optionalDate);
		if (this.max && optionalDate > this.max) throw new Feedback(`Maximum ${formatDate(this.max)}`, optionalDate);
		return getYMD(optionalDate);
	}
}

/** Valid date, e.g. `2005-09-12` (required because falsy values are invalid). */
export const DATE = new DateSchema({});

/** Valid date, e.g. `2005-09-12`, or `null` */
export const OPTIONAL_DATE = OPTIONAL(DATE);
