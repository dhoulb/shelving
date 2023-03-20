import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { roundStep } from "../util/number.js";
import { PossibleTime, getOptionalTime, Time, PossibleOptionalTime } from "../util/time.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { Schema, SchemaOptions } from "./Schema.js";

/** Allowed options for `TimeSchama` */
export type TimeSchemaOptions = SchemaOptions & {
	readonly value?: PossibleTime | undefined;
	readonly min?: PossibleOptionalTime | undefined;
	readonly max?: PossibleOptionalTime | undefined;
	readonly step?: number | null | undefined;
};

/** Define a valid time in 24h hh:mm:ss.fff format, e.g. `23:59` or `24:00 */
export class TimeSchema extends Schema<string> {
	override readonly value: PossibleTime;
	readonly min: Time | null;
	readonly max: Time | null;
	/**
	 * Rounding step (in milliseconds, because that's the base unit for time), e.g. `60000` will round to the nearest second.
	 * - Note: `<input type="time">` elements expect `step=""` to be  in _seconds_ so you need to multiply this by `1000`
	 */
	readonly step: number | null;
	constructor({ value = "now", min = null, max = null, step = 60, ...options }: TimeSchemaOptions) {
		super(options);
		this.value = value;
		this.min = getOptionalTime(min);
		this.max = getOptionalTime(max);
		this.step = step;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const unsafeTime = getOptionalTime(unsafeValue);
		if (!unsafeTime) throw new InvalidFeedback(unsafeValue ? "Invalid time" : "Required", { value: unsafeValue });
		const safeTime = typeof this.step === "number" ? new Time(roundStep(unsafeTime.time, this.step)) : unsafeTime;
		if (this.max && safeTime > this.max) throw new InvalidFeedback(`Maximum ${this.max.format()}`, { value: safeTime });
		if (this.min && safeTime < this.min) throw new InvalidFeedback(`Minimum ${this.min.format()}`, { value: safeTime });
		return safeTime.long;
	}
}

/** Valid time, e.g. `2005-09-12` (required because falsy values are invalid). */
export const TIME = new TimeSchema({});

/** Valid time, e.g. `2005-09-12`, or `null` */
export const OPTIONAL_TIME = OPTIONAL(TIME);