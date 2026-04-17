import { DAY, HOUR, MINUTE, MONTH, SECOND, WEEK, YEAR } from "./constants.js";
import { getMidnight, type PossibleDate, requireDate } from "./date.js";
import type { FormatOptions, UnitFormatOptions } from "./format.js";
import type { AnyCaller } from "./function.js";
import type { MapKey } from "./map.js";
import { type Unit, UnitList } from "./units.js";

/** Duration data object. */
export type DurationData = { [K in Intl.DurationFormatUnit]?: number };

/** Get the millisecond difference between two dates. */
export function getMilliseconds(from?: PossibleDate, to?: PossibleDate, caller: AnyCaller = getMilliseconds): number {
	return requireDate(to, caller).getTime() - requireDate(from, caller).getTime();
}

/** Count the various time units between two dates and return a `Duration` format. */
export function getDuration(from?: PossibleDate, to?: PossibleDate, caller: AnyCaller = getDuration): DurationData {
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
export function getUntil(target: PossibleDate, current: PossibleDate = "now", caller: AnyCaller = getUntil): DurationData {
	return getDuration(current, target, caller);
}

/** Get the various time units since a certain date. */
export function getAgo(target: PossibleDate, current: PossibleDate = "now", caller: AnyCaller = getAgo): DurationData {
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

/** Duration units. */
export const DURATION_UNITS = new UnitList({
	millisecond: { roundingMode: "trunc", maximumFractionDigits: 0, abbr: "ms" },
	second: { roundingMode: "trunc", maximumFractionDigits: 0, to: { millisecond: SECOND } },
	minute: { roundingMode: "trunc", maximumFractionDigits: 0, to: { millisecond: MINUTE } },
	hour: { roundingMode: "trunc", maximumFractionDigits: 0, to: { millisecond: HOUR } },
	day: { roundingMode: "trunc", maximumFractionDigits: 0, to: { millisecond: DAY } },
	week: { roundingMode: "trunc", maximumFractionDigits: 0, to: { millisecond: WEEK } },
	month: { roundingMode: "trunc", maximumFractionDigits: 0, to: { millisecond: MONTH } },
	year: { roundingMode: "trunc", maximumFractionDigits: 0, to: { millisecond: YEAR } },
});
export type DurationUnitKey = MapKey<typeof DURATION_UNITS>;

/**
 * Get a best-fit duration unit based on an amount in milliseconds.
 * - Makes a sensible choice about the best time unit to use.
 * - Years will be used for anything 18 months or more, e.g. `in 2 years`
 * - Months will be used for anything 10 weeks or more, e.g. `in 14 months`
 * - Weeks will be used for anything 10 days or more, e.g. `in 9 weeks`
 * - Days will be used for anything 1 day or more, e.g. `in 13 days`
 * - Hours will be used for anything 1 hour or more, e.g. `in 23 hours`
 * - Minutes will be used for anything 1 minute or more, e.g. `1 minute ago` or `in 59 minutes`
 * - Seconds will be used for anything 1000 milliseconds or more, e.g. `in 59 seconds`
 */
export function getBestDurationUnit(ms: number): Unit<DurationUnitKey> {
	const abs = Math.abs(ms);
	if (abs >= 18 * MONTH) return DURATION_UNITS.require("year");
	if (abs >= 10 * WEEK) return DURATION_UNITS.require("month");
	if (abs >= 10 * DAY) return DURATION_UNITS.require("week");
	if (abs >= DAY) return DURATION_UNITS.require("day");
	if (abs >= HOUR) return DURATION_UNITS.require("hour");
	if (abs >= MINUTE) return DURATION_UNITS.require("minute");
	if (abs >= SECOND) return DURATION_UNITS.require("second");
	return DURATION_UNITS.require("millisecond");
}

/**
 * Compact best-fit when a date happens/happened, e.g. `in 10d` or `2h ago` or `in 1w` or `just now`
 * - See `getBestTimeUnit()` for details on how the best-fit unit is chosen.
 * - But: anything under 30 seconds will show `just now`, which makes more sense in most UIs.
 */
export function formatWhen(
	target: PossibleDate,
	current?: PossibleDate,
	options?: UnitFormatOptions,
	caller: AnyCaller = formatWhen,
): string {
	const ms = getMilliseconds(current, target, caller);
	const abs = Math.abs(ms);
	if (abs < 30 * SECOND) return "just now";
	const unit = getBestDurationUnit(ms);
	return ms > 0 ? `in ${unit.format(unit.from(abs), options)}` : `${unit.format(unit.from(abs), options)} ago`;
}

/** Compact when a date happens, e.g. `10d` or `2h` or `-1w` */
export function formatUntil(
	target: PossibleDate,
	current?: PossibleDate,
	options?: UnitFormatOptions,
	caller: AnyCaller = formatUntil,
): string {
	const ms = getMilliseconds(current, target, caller);
	const unit = getBestDurationUnit(ms);
	return unit.format(unit.from(ms), options);
}

/** Compact when a date will happen, e.g. `10d` or `2h` or `-1w` */
export function formatAgo(
	target: PossibleDate,
	current?: PossibleDate,
	options?: UnitFormatOptions,
	caller: AnyCaller = formatAgo,
): string {
	const ms = getMilliseconds(target, current, caller);
	const unit = getBestDurationUnit(ms);
	return unit.format(unit.from(ms), options);
}

interface DurationFormatOptions extends FormatOptions, Intl.DurationFormatOptions {}

/** Format a duration as a string, e.g. `1 year, 2 months, 3 days` or `1y 2m 3d` */
export function formatDuration(duration: DurationData, options?: DurationFormatOptions): string {
	return new Intl.DurationFormat(options?.locale, options).format(duration);
}
