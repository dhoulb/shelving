import { MONTH, WEEK, DAY, HOUR, SECOND } from "./constants.js";
import { getDuration, PossibleDate } from "./date.js";
import { getMapItem } from "./map.js";
import { TimeUnitKey, TIME_UNITS } from "./units.js";

/** Get the ID for a time unit based on the amount in milliseconds. */
function _getTimeUnitKey(ms: number): TimeUnitKey {
	const abs = Math.abs(ms);
	if (abs > 18 * MONTH) return "year";
	if (abs > 10 * WEEK) return "month";
	if (abs > 2 * WEEK) return "week";
	if (abs > DAY) return "day";
	if (abs > HOUR) return "hour";
	if (abs > 9949) return "minute";
	if (abs > SECOND) return "second";
	return "millisecond";
}

/** Format a full format of a duration of time using the most reasonable units e.g. `5 years` or `1 week` or `4 minutes` or `12 milliseconds`. */
export function formatFullDuration(ms: number, precision?: number): string {
	const unit = getMapItem(TIME_UNITS, _getTimeUnitKey(ms));
	return unit.formatFull(unit.from(ms), precision);
}

/** Format a description of a duration of time using the most reasonable units e.g. `5y` or `4m` or `12ms`. */
export function formatDuration(ms: number, precision?: number): string {
	const unit = getMapItem(TIME_UNITS, _getTimeUnitKey(ms));
	return unit.format(unit.from(ms), precision);
}

/** format when a data happens/happened. */
function _formatWhen(formatter: typeof formatFullDuration | typeof formatDuration, target: PossibleDate, current?: PossibleDate) {
	const ms = getDuration(target, current);
	const abs = Math.abs(ms);
	const duration = formatter(ms);
	return abs < 10 * SECOND ? "just now" : ms > 0 ? `in ${duration}` : `${duration} ago`;
}

/** Full when a date happens/happened, e.g. `in 10 days` or `2 hours ago` */
export const formatFullWhen = (target: PossibleDate, current?: PossibleDate): string => _formatWhen(formatFullDuration, target, current);

/** Compact when a date happens/happened, e.g. `in 10d` or `2h ago` or `in 1w` */
export const formatWhen = (target: PossibleDate, current?: PossibleDate): string => _formatWhen(formatDuration, target, current);

/** Full when a date happens, e.g. `10 days` or `2 hours` or `-1 week` */
export const formatFullUntil = (target: PossibleDate, current?: PossibleDate): string => formatFullDuration(getDuration(target, current));

/** Compact when a date happens, e.g. `10d` or `2h` or `-1w` */
export const formatUntil = (target: PossibleDate, current?: PossibleDate): string => formatDuration(getDuration(target, current));

/** Full when a date happened, e.g. `10 days` or `2 hours` or `-1 week` */
export const formatFullAgo = (target: PossibleDate, current?: PossibleDate): string => formatFullDuration(getDuration(current, target));

/** Compact when a date will happen, e.g. `10d` or `2h` or `-1w` */
export const formatAgo = (target: PossibleDate, current?: PossibleDate): string => formatDuration(getDuration(current, target));
