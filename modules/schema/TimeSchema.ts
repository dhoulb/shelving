import { ValueFeedback } from "../feedback/Feedback.js";
import { type PossibleDate, getDate, requireTime } from "../util/date.js";
import { formatTime } from "../util/format.js";
import { roundStep } from "../util/number.js";
import { DateSchema, type DateSchemaOptions } from "./DateSchema.js";
import { NULLABLE } from "./NullableSchema.js";

/** Allowed options for `TimeSchama` */
export interface TimeSchemaOptions extends DateSchemaOptions {
	step?: number | undefined;
}

/** Define a valid time in 24h hh:mm:ss.fff format, e.g. `23:59` or `24:00 */
export class TimeSchema extends DateSchema {
	declare readonly value: PossibleDate;
	/**
	 * Rounding step (in milliseconds, because that's the base unit for time), e.g. `60000` will round to the nearest second.
	 * - Note: `<input type="time">` elements expect `step=""` to be  in _seconds_ so you need to multiply this by `1000`
	 */
	readonly step: number | undefined;
	constructor({ title = "Time", step, ...options }: TimeSchemaOptions) {
		super({ title, ...options });
		this.step = step;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const date = getDate(unsafeValue);
		if (!date) throw new ValueFeedback(unsafeValue ? "Invalid time" : "Required", unsafeValue);
		const rounded = typeof this.step === "number" ? new Date(roundStep(date.getTime(), this.step)) : date;
		if (this.max && rounded > this.max) throw new ValueFeedback(`Maximum ${formatTime(this.max)}`, rounded);
		if (this.min && rounded < this.min) throw new ValueFeedback(`Minimum ${formatTime(this.min)}`, rounded);
		return requireTime(rounded);
	}
}

/** Valid time, e.g. `2005-09-12` (required because falsy values are invalid). */
export const TIME = new TimeSchema({});

/** Valid time, e.g. `2005-09-12`, or `null` */
export const NULLABLE_TIME = NULLABLE(TIME);
