import { ValueFeedback } from "../feedback/Feedback.js";
import type { PossibleDate } from "../util/date.js";
import { getDate, requireDateString } from "../util/date.js";
import { formatDate } from "../util/format.js";
import type { Nullish } from "../util/null.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** `type=""` prop for HTML `<input />` tags that are relevant for dates. */
export type DateInputType = "time" | "date" | "datetime-local";

/** Allowed options for `DateSchema` */
export interface DateSchemaOptions extends SchemaOptions {
	readonly value?: PossibleDate | undefined;
	readonly min?: Nullish<PossibleDate>;
	readonly max?: Nullish<PossibleDate>;
	readonly input?: DateInputType | undefined;
}

export class DateSchema extends Schema<string> {
	declare readonly value: PossibleDate;
	readonly min: Date | undefined;
	readonly max: Date | undefined;
	readonly input: DateInputType;
	constructor({ min, max, value = "now", input = "date", ...options }: DateSchemaOptions) {
		super({ title: "Date", value, ...options });
		this.min = getDate(min);
		this.max = getDate(max);
		this.input = input;
	}
	override validate(value: unknown = this.value): string {
		const date = getDate(value);
		if (!date) throw new ValueFeedback(value ? "Invalid date" : "Required", value);
		if (this.min && date < this.min) throw new ValueFeedback(`Minimum ${this.format(this.min)}`, date);
		if (this.max && date > this.max) throw new ValueFeedback(`Maximum ${this.format(this.max)}`, date);
		return this.stringify(date);
	}
	stringify(value: Date): string {
		return requireDateString(value);
	}
	format(value: Date): string {
		return formatDate(value);
	}
}

/** Valid date, e.g. `2005-09-12` (required because falsy values are invalid). */
export const DATE = new DateSchema({});

/** Valid date, e.g. `2005-09-12`, or `null` */
export const NULLABLE_DATE = NULLABLE(DATE);
