import { DAY, HOUR, MONTH, SECOND, WEEK } from "./constants.js";
import { type PossibleDate, getDuration } from "./date.js";
import { type NumberOptions, formatNumber } from "./number.js";
import { TIME_UNITS, type TimeUnitKey, type Unit } from "./units.js";

/** Get an appropriate time unit based on an amount in milliseconds. */
function _getTimeUnit(ms: number): Unit<TimeUnitKey> {
	const abs = Math.abs(ms);
	if (abs > 18 * MONTH) return TIME_UNITS.getUnit("year");
	if (abs > 10 * WEEK) return TIME_UNITS.getUnit("month");
	if (abs > 2 * WEEK) return TIME_UNITS.getUnit("week");
	if (abs > DAY) return TIME_UNITS.getUnit("day");
	if (abs > HOUR) return TIME_UNITS.getUnit("hour");
	if (abs > 9949) return TIME_UNITS.getUnit("minute");
	if (abs > SECOND) return TIME_UNITS.getUnit("second");
	return TIME_UNITS.getUnit("millisecond");
}

/** Default number options for duration (no decimal places and rounding down). */
const DURATION_OPTIONS: NumberOptions = {
	style: "unit",
	unitDisplay: "narrow",
	maximumFractionDigits: 0,
	roundingMode: "trunc",
	roundingPriority: "lessPrecision",
};

/** Format a description of a duration of time using the most reasonable units e.g. `5y` or `4m` or `12ms`. */
export function formatDuration(ms: number, options?: NumberOptions): string {
	const unit = _getTimeUnit(ms);
	return formatNumber(unit.from(ms), { ...DURATION_OPTIONS, ...options, unit: unit.key });
}

/** Compact when a date happens/happened, e.g. `in 10d` or `2h ago` or `in 1w` or `just now` */
export function formatWhen(target: PossibleDate, current?: PossibleDate, options?: NumberOptions): string {
	const ms = getDuration(target, current);
	const abs = Math.abs(ms);
	return abs < 30 * SECOND ? "just now" : ms > 0 ? `in ${formatDuration(abs, options)}` : `${formatDuration(abs, options)} ago`;
}

/** Compact when a date happens, e.g. `10d` or `2h` or `-1w` */
export function formatUntil(target: PossibleDate, current?: PossibleDate, options?: NumberOptions): string {
	return formatDuration(getDuration(target, current), options);
}

/** Compact when a date will happen, e.g. `10d` or `2h` or `-1w` */
export function formatAgo(target: PossibleDate, current?: PossibleDate, options?: NumberOptions): string {
	return formatDuration(getDuration(current, target), options);
}
