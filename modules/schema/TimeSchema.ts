import { ValueFeedback } from "../feedback/Feedback.js";
import { type PossibleDate, getDate, requireTime } from "../util/date.js";
import { formatTime } from "../util/format.js";
import type { Nullish } from "../util/null.js";
import { roundStep } from "../util/number.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `TimeSchama` */
export interface TimeSchemaOptions extends SchemaOptions {
	readonly value?: PossibleDate | undefined;
	readonly min?: Nullish<PossibleDate>;
	readonly max?: Nullish<PossibleDate>;
	readonly step?: number | undefined;
}

/** Define a valid time in 24h hh:mm:ss.fff format, e.g. `23:59` or `24:00 */
export class TimeSchema extends Schema<string> {
	declare readonly value: PossibleDate;
	readonly min: Date | undefined;
	readonly max: Date | undefined;
	/**
	 * Rounding step (in milliseconds, because that's the base unit for time), e.g. `60000` will round to the nearest second.
	 * - Note: `<input type="time">` elements expect `step=""` to be  in _seconds_ so you need to multiply this by `1000`
	 */
	readonly step: number | undefined;
	constructor({ min, max, step = 1000, title = "Time", value = "now", ...options }: TimeSchemaOptions) {
		super({ title, value, ...options });
		this.min = getDate(min);
		this.max = getDate(max);
		this.step = step;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const date = getDate(unsafeValue);
		if (!date) throw new ValueFeedback(unsafeValue ? "Invalid time" : "Required", unsafeValue);
		const roundedTime = typeof this.step === "number" ? new Date(roundStep(date.getTime(), this.step)) : date;
		if (this.max && roundedTime > this.max) throw new ValueFeedback(`Maximum ${formatTime(this.max)}`, roundedTime);
		if (this.min && roundedTime < this.min) throw new ValueFeedback(`Minimum ${formatTime(this.min)}`, roundedTime);
		return requireTime(roundedTime);
	}
}

/** Valid time, e.g. `2005-09-12` (required because falsy values are invalid). */
export const TIME = new TimeSchema({});

/** Valid time, e.g. `2005-09-12`, or `null` */
export const NULLABLE_TIME = NULLABLE(TIME);
