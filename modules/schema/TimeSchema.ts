import { ValueFeedback } from "../feedback/Feedback.js";
import { roundStep } from "../util/number.js";
import type { Optional } from "../util/optional.js";
import type { PossibleTime } from "../util/time.js";
import { Time, getOptionalTime } from "../util/time.js";
import { OPTIONAL } from "./OptionalSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { Schema } from "./Schema.js";

/** Allowed options for `TimeSchama` */
export interface TimeSchemaOptions extends SchemaOptions {
	readonly value?: PossibleTime | undefined;
	readonly min?: Optional<PossibleTime> | undefined;
	readonly max?: Optional<PossibleTime> | undefined;
	readonly step?: number | undefined;
}

/** Define a valid time in 24h hh:mm:ss.fff format, e.g. `23:59` or `24:00 */
export class TimeSchema extends Schema<string> {
	declare readonly value: PossibleTime;
	readonly min: Time | undefined;
	readonly max: Time | undefined;
	/**
	 * Rounding step (in milliseconds, because that's the base unit for time), e.g. `60000` will round to the nearest second.
	 * - Note: `<input type="time">` elements expect `step=""` to be  in _seconds_ so you need to multiply this by `1000`
	 */
	readonly step: number | undefined;
	constructor({ min, max, step = 60, title = "Time", value = "now", ...options }: TimeSchemaOptions) {
		super({ title, value, ...options });
		this.min = getOptionalTime(min);
		this.max = getOptionalTime(max);
		this.step = step;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const optionalTime = getOptionalTime(unsafeValue);
		if (!optionalTime) throw new ValueFeedback(unsafeValue ? "Invalid time" : "Required", unsafeValue);
		const roundedTime = typeof this.step === "number" ? new Time(roundStep(optionalTime.time, this.step)) : optionalTime;
		if (this.max && roundedTime > this.max) throw new ValueFeedback(`Maximum ${this.max.format()}`, roundedTime);
		if (this.min && roundedTime < this.min) throw new ValueFeedback(`Minimum ${this.min.format()}`, roundedTime);
		return roundedTime.long;
	}
}

/** Valid time, e.g. `2005-09-12` (required because falsy values are invalid). */
export const TIME = new TimeSchema({});

/** Valid time, e.g. `2005-09-12`, or `null` */
export const OPTIONAL_TIME = OPTIONAL(TIME);
