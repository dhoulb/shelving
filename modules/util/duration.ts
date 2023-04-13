import { MONTH, WEEK, DAY, HOUR, SECOND } from "./constants.js";
import { getDuration, PossibleDate } from "./date.js";
import { NumberOptions } from "./number.js";
import { Unit, TimeUnitKey, TIME_UNITS } from "./units.js";

/** Get an appropriate time unit based on an amount in milliseconds. */
function _getTimeUnit(ms: number): Unit<TimeUnitKey> {
	const abs = Math.abs(ms);
	if (abs > 18 * MONTH) return TIME_UNITS.unit("year");
	if (abs > 10 * WEEK) return TIME_UNITS.unit("month");
	if (abs > 2 * WEEK) return TIME_UNITS.unit("week");
	if (abs > DAY) return TIME_UNITS.unit("day");
	if (abs > HOUR) return TIME_UNITS.unit("hour");
	if (abs > 9949) return TIME_UNITS.unit("minute");
	if (abs > SECOND) return TIME_UNITS.unit("second");
	return TIME_UNITS.unit("millisecond");
}

/** Default number options for duration (no decimal places and rounding down). */
const NUMBER_OPTIONS: NumberOptions = { maximumFractionDigits: 0, roundingMode: "trunc" };

/** Format a full format of a duration of time using the most reasonable units e.g. `5 years` or `1 week` or `4 minutes` or `12 milliseconds`. */
export function pluralizeDuration(ms: number): string {
	const unit = _getTimeUnit(ms);
	return unit.pluralize(unit.from(ms), NUMBER_OPTIONS);
}

/** Format a description of a duration of time using the most reasonable units e.g. `5y` or `4m` or `12ms`. */
export function formatDuration(ms: number): string {
	const unit = _getTimeUnit(ms);
	return unit.format(unit.from(ms), NUMBER_OPTIONS);
}

/** format when a data happens/happened. */
function _formatWhen(formatter: typeof pluralizeDuration | typeof formatDuration, target: PossibleDate, current?: PossibleDate) {
	const ms = getDuration(target, current);
	const abs = Math.abs(ms);
	const duration = formatter(ms);
	return abs < 10 * SECOND ? "just now" : ms > 0 ? `in ${duration}` : `${duration} ago`;
}

/** Full when a date happens/happened, e.g. `in 10 days` or `2 hours ago` */
export const pluralizeWhen = (target: PossibleDate, current?: PossibleDate): string => _formatWhen(pluralizeDuration, target, current);

/** Compact when a date happens/happened, e.g. `in 10d` or `2h ago` or `in 1w` */
export const formatWhen = (target: PossibleDate, current?: PossibleDate): string => _formatWhen(formatDuration, target, current);

/** Full when a date happens, e.g. `10 days` or `2 hours` or `-1 week` */
export const pluralizeUntil = (target: PossibleDate, current?: PossibleDate): string => pluralizeDuration(getDuration(target, current));

/** Compact when a date happens, e.g. `10d` or `2h` or `-1w` */
export const formatUntil = (target: PossibleDate, current?: PossibleDate): string => formatDuration(getDuration(target, current));

/** Full when a date happened, e.g. `10 days` or `2 hours` or `-1 week` */
export const pluralizeAgo = (target: PossibleDate, current?: PossibleDate): string => pluralizeDuration(getDuration(current, target));

/** Compact when a date will happen, e.g. `10d` or `2h` or `-1w` */
export const formatAgo = (target: PossibleDate, current?: PossibleDate): string => formatDuration(getDuration(current, target));
