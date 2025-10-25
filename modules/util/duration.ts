import { DAY, HOUR, MINUTE, MONTH, SECOND, WEEK, YEAR } from "./constants.js";
import { getMidnight, type PossibleDate, requireDate } from "./date.js";
import type { AnyCaller } from "./function.js";
import { TIME_UNITS, type TimeUnitKey, type Unit } from "./units.js";

/**
 * Duration object.
 * - This should be compatible with `Intl.DurationFormat` when that is available.
 */

export type Duration = {
	readonly years?: number | undefined;
	readonly months?: number | undefined;
	readonly weeks?: number | undefined;
	readonly days?: number | undefined;
	readonly hours?: number | undefined;
	readonly minutes?: number | undefined;
	readonly seconds?: number | undefined;
	readonly milliseconds?: number | undefined;
	readonly microseconds?: number | undefined;
	readonly nanoseconds?: number | undefined;
};

/** Get the millisecond difference between two dates. */
export function getMilliseconds(from?: PossibleDate, to?: PossibleDate, caller: AnyCaller = getMilliseconds): number {
	return requireDate(to, caller).getTime() - requireDate(from, caller).getTime();
}

/** Count the various time units between two dates and return a `Duration` format. */
export function getDuration(from?: PossibleDate, to?: PossibleDate, caller: AnyCaller = getDuration): Duration {
	const ms = getMilliseconds(from, to, caller);
	return {
		years: Math.trunc(ms / YEAR),
		months: Math.trunc((ms % YEAR) / MONTH),
		weeks: Math.trunc((ms % MONTH) / WEEK),
		days: Math.trunc((ms % WEEK) / DAY),
		hours: Math.trunc((ms % DAY) / HOUR),
		minutes: Math.trunc((ms % HOUR) / MINUTE),
		seconds: Math.trunc((ms % MINUTE) / SECOND),
		milliseconds: Math.trunc((ms % SECOND) / 1),
	};
}

/** Get the various time units until a certain date. */
export function getUntil(target: PossibleDate, current: PossibleDate = "now", caller: AnyCaller = getUntil): Duration {
	return getDuration(current, target, caller);
}

/** Get the various time units since a certain date. */
export function getAgo(target: PossibleDate, current: PossibleDate = "now", caller: AnyCaller = getAgo): Duration {
	return getDuration(target, current, caller);
}

/** Count the milliseconds until a date. */
export function getMillisecondsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMillisecondsUntil): number {
	return getMilliseconds(current, target, caller);
}

/** Count the milliseconds since a date. */
export function getMillisecondsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMillisecondsAgo): number {
	return 0 - getMillisecondsUntil(target, current, caller);
}

/**
 * Count the whole seconds until a date.
 * - Rounds to the nearest whole second, i.e. `1 second 499 ms` returns `1`
 */
export function getSecondsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getSecondsUntil): number {
	return Math.round(getMilliseconds(current, target, caller) / SECOND);
}

/**
 * Count the whole seconds since a date.
 * - Rounds to the nearest whole second, i.e. `1 second 499 ms` returns `1`
 */
export function getSecondsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getSecondsAgo): number {
	return 0 - getSecondsUntil(target, current, caller);
}

/**
 * Count the whole minutes until a date.
 * - Rounds to the nearest whole minute, i.e. `1 min 29 seconds` returns `1`
 */
export function getMinutesUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMinutesUntil): number {
	return Math.round(getMilliseconds(current, target, caller) / MINUTE);
}

/**
 * Count the whole minutes since a date.
 * - Rounds to the nearest whole minute, i.e. `1 min 29 seconds` returns `1`
 */
export function getMinutesAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMinutesAgo): number {
	return 0 - getMinutesUntil(target, current, caller);
}

/**
 * Count the whole hours until a date.
 * - Rounds to the nearest whole hour, i.e. `1 hour 29 minutes` returns `1`
 */
export function getHoursUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getHoursUntil): number {
	return Math.round(getMilliseconds(current, target, caller) / HOUR);
}

/**
 * Count the whole hours since a date.
 * - Rounds to the nearest whole hour, i.e. `1 hour 29 minutes` returns `1`
 */
export function getHoursAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getHoursAgo): number {
	return 0 - getHoursUntil(target, current, caller);
}

/**
 * Count the calendar days until a date.
 * - e.g. from 23:59 to 00:01 is 1 day, even though it's only 1 minutes.
 */
export function getDaysUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getDaysUntil): number {
	return Math.round((getMidnight(target, caller).getTime() - getMidnight(current, caller).getTime()) / DAY);
}

/**
 * Count the calendar days since a date.
 * - Rounds to the nearest whole days.
 */
export function getDaysAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getDaysAgo): number {
	return 0 - getDaysUntil(target, current, caller);
}

/**
 * Count the whole weeks until a date.
 * - Rounds down to the nearest whole week, i.e.
 */
export function getWeeksUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getWeeksUntil): number {
	return Math.trunc(getDaysUntil(target, current, caller) / 7);
}

/**
 * Count the whole weeks since a date.
 * - Rounds to the nearest whole week.
 */
export function getWeeksAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getWeeksAgo): number {
	return 0 - getWeeksUntil(target, current, caller);
}

/**
 * Count the calendar months until a date.
 * - e.g. from March 31st to April 1st is 1 month, even though it's only 1 day.
 */
export function getMonthsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMonthsUntil): number {
	const t = requireDate(target, caller);
	const c = requireDate(current, caller);
	const years = t.getFullYear() - c.getFullYear();
	const months = t.getMonth() - c.getMonth();
	return years * 12 + months;
}

/**
 * Count the calendar months since a date.
 * - e.g. from March 31st to April 1st is 1 month, even though it's only 1 day.
 */
export function getMonthsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMonthsAgo): number {
	return 0 - getMonthsUntil(target, current, caller);
}

/**
 * Count the calendar years until a date.
 * - e.g. from December 31st to January 1st is 1 year, even though it's only 1 day.
 */
export function getYearsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getYearsUntil): number {
	return requireDate(target, caller).getFullYear() - requireDate(current, caller).getFullYear();
}

/**
 * Count the calendar years since a date.
 * - Note this counts calendar years, not 365-day periods.
 * - e.g. from December 31st to January 1st is -1 years, even though it's only 1 day.
 */
export function getYearsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getYearsAgo): number {
	return 0 - getYearsUntil(target, current, caller);
}

/** Is a date in the past? */
export function isPast(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isPast): boolean {
	return getMilliseconds(current, target, caller) < 0;
}

/** Is a date in the future? */
export function isFuture(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isFuture): boolean {
	return getMilliseconds(current, target, caller) > 0;
}

/** Is a date today (taking into account midnight). */
export function isToday(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isToday): boolean {
	return getDaysUntil(target, current, caller) === 0;
}

/**
 * Get a best-fit time unit based on an amount in milliseconds.
 * - Makes a sensible choice about the best time unit to use.
 * - Years will be used for anything 18 months or more, e.g. `in 2 years`
 * - Months will be used for anything 10 weeks or more, e.g. `in 14 months`
 * - Weeks will be used for anything 2 weeks or more, e.g. `in 9 weeks`
 * - Days will be used for anything 24 hours or more, e.g. `in 13 days`
 * - Hours will be used for anything 90 minutes or more, e.g. `in 23 hours`
 * - Minutes will be used for anything 1 second or more, e.g. `1 minute ago` or `in 59 minutes`
 * - Seconds will be used for anything 1000 milliseconds or more, e.g. `in 59 seconds`
 */
export function getBestTimeUnit(ms: number): Unit<TimeUnitKey> {
	const abs = Math.abs(ms);
	if (abs > 18 * MONTH) return TIME_UNITS.require("year");
	if (abs > 10 * WEEK) return TIME_UNITS.require("month");
	if (abs > DAY) return TIME_UNITS.require("day");
	if (abs > HOUR) return TIME_UNITS.require("hour");
	if (abs > MINUTE * 90) return TIME_UNITS.require("minute");
	if (abs > SECOND) return TIME_UNITS.require("second");
	return TIME_UNITS.require("millisecond");
}
