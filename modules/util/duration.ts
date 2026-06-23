import { DAY, HOUR, MINUTE, MONTH, SECOND, WEEK, YEAR } from "./constants.js";
import { getMidnight, type PossibleDate, requireDate } from "./date.js";
import type { FormatOptions, UnitFormatOptions } from "./format.js";
import type { AnyCaller } from "./function.js";
import type { MapKey } from "./map.js";
import { type Unit, UnitList } from "./units.js";

/**
 * Duration data object keyed by `Intl.DurationFormatUnit`.
 *
 * @see https://shelving.cc/util/duration/DurationData
 */
export type DurationData = { [K in Intl.DurationFormatUnit]?: number };

/**
 * Get the millisecond difference between two dates.
 *
 * @param from Date the duration is measured from (defaults to now).
 * @param to Date the duration is measured to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getMilliseconds` itself).
 * @returns Number of milliseconds from `from` to `to` (negative if `to` is before `from`).
 * @throws {RequiredError} If `from` or `to` cannot be converted to a valid date.
 * @example getMilliseconds("2025-01-01", "2025-01-02") // 86400000
 * @see https://shelving.cc/util/duration/getMilliseconds
 */
export function getMilliseconds(from?: PossibleDate, to?: PossibleDate, caller: AnyCaller = getMilliseconds): number {
	return requireDate(to, caller).getTime() - requireDate(from, caller).getTime();
}

/**
 * Count the various time units between two dates and return a `Duration` format.
 *
 * @param from Date the duration is measured from (defaults to now).
 * @param to Date the duration is measured to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getDuration` itself).
 * @returns `DurationData` object breaking the span down into years, months, weeks, days, hours, minutes, seconds, and milliseconds.
 * @throws {RequiredError} If `from` or `to` cannot be converted to a valid date.
 * @example getDuration("2025-01-01", "2025-01-02") // { years: 0, months: 0, weeks: 0, days: 1, ... }
 * @see https://shelving.cc/util/duration/getDuration
 */
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

/**
 * Get the various time units until a certain date.
 *
 * @param target Date the duration counts up to.
 * @param current Date the duration counts from (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getUntil` itself).
 * @returns `DurationData` object for the span from `current` to `target`.
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getUntil("2099-01-01") // { years: 73, ... }
 * @see https://shelving.cc/util/duration/getUntil
 */
export function getUntil(target: PossibleDate, current: PossibleDate = "now", caller: AnyCaller = getUntil): DurationData {
	return getDuration(current, target, caller);
}

/**
 * Get the various time units since a certain date.
 *
 * @param target Date the duration counts back from.
 * @param current Date the duration counts to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getAgo` itself).
 * @returns `DurationData` object for the span from `target` to `current`.
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getAgo("2000-01-01") // { years: 26, ... }
 * @see https://shelving.cc/util/duration/getAgo
 */
export function getAgo(target: PossibleDate, current: PossibleDate = "now", caller: AnyCaller = getAgo): DurationData {
	return getDuration(target, current, caller);
}

/**
 * Count the milliseconds until a date.
 *
 * @param target Date to count up to.
 * @param current Date to count from (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getMillisecondsUntil` itself).
 * @returns Number of milliseconds from `current` to `target` (negative if `target` is in the past).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getMillisecondsUntil("2099-01-01") // 2303683200000
 * @see https://shelving.cc/util/duration/getMillisecondsUntil
 */
export function getMillisecondsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMillisecondsUntil): number {
	return getMilliseconds(current, target, caller);
}

/**
 * Count the milliseconds since a date.
 *
 * @param target Date to count back from.
 * @param current Date to count to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getMillisecondsAgo` itself).
 * @returns Number of milliseconds from `target` to `current` (negative if `target` is in the future).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getMillisecondsAgo("2000-01-01") // 833587200000
 * @see https://shelving.cc/util/duration/getMillisecondsAgo
 */
export function getMillisecondsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMillisecondsAgo): number {
	return 0 - getMillisecondsUntil(target, current, caller);
}

/**
 * Count the whole seconds until a date.
 * - Rounds to the nearest whole second, i.e. `1 second 499 ms` returns `1`
 *
 * @param target Date to count up to.
 * @param current Date to count from (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getSecondsUntil` itself).
 * @returns Number of whole seconds from `current` to `target` (negative if `target` is in the past).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getSecondsUntil(target) // 90
 * @see https://shelving.cc/util/duration/getSecondsUntil
 */
export function getSecondsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getSecondsUntil): number {
	return Math.round(getMilliseconds(current, target, caller) / SECOND);
}

/**
 * Count the whole seconds since a date.
 * - Rounds to the nearest whole second, i.e. `1 second 499 ms` returns `1`
 *
 * @param target Date to count back from.
 * @param current Date to count to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getSecondsAgo` itself).
 * @returns Number of whole seconds from `target` to `current` (negative if `target` is in the future).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getSecondsAgo(target) // 90
 * @see https://shelving.cc/util/duration/getSecondsAgo
 */
export function getSecondsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getSecondsAgo): number {
	return 0 - getSecondsUntil(target, current, caller);
}

/**
 * Count the whole minutes until a date.
 * - Rounds to the nearest whole minute, i.e. `1 min 29 seconds` returns `1`
 *
 * @param target Date to count up to.
 * @param current Date to count from (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getMinutesUntil` itself).
 * @returns Number of whole minutes from `current` to `target` (negative if `target` is in the past).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getMinutesUntil(target) // 5
 * @see https://shelving.cc/util/duration/getMinutesUntil
 */
export function getMinutesUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMinutesUntil): number {
	return Math.round(getMilliseconds(current, target, caller) / MINUTE);
}

/**
 * Count the whole minutes since a date.
 * - Rounds to the nearest whole minute, i.e. `1 min 29 seconds` returns `1`
 *
 * @param target Date to count back from.
 * @param current Date to count to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getMinutesAgo` itself).
 * @returns Number of whole minutes from `target` to `current` (negative if `target` is in the future).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getMinutesAgo(target) // 5
 * @see https://shelving.cc/util/duration/getMinutesAgo
 */
export function getMinutesAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMinutesAgo): number {
	return 0 - getMinutesUntil(target, current, caller);
}

/**
 * Count the whole hours until a date.
 * - Rounds to the nearest whole hour, i.e. `1 hour 29 minutes` returns `1`
 *
 * @param target Date to count up to.
 * @param current Date to count from (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getHoursUntil` itself).
 * @returns Number of whole hours from `current` to `target` (negative if `target` is in the past).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getHoursUntil(target) // 3
 * @see https://shelving.cc/util/duration/getHoursUntil
 */
export function getHoursUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getHoursUntil): number {
	return Math.round(getMilliseconds(current, target, caller) / HOUR);
}

/**
 * Count the whole hours since a date.
 * - Rounds to the nearest whole hour, i.e. `1 hour 29 minutes` returns `1`
 *
 * @param target Date to count back from.
 * @param current Date to count to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getHoursAgo` itself).
 * @returns Number of whole hours from `target` to `current` (negative if `target` is in the future).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getHoursAgo(target) // 3
 * @see https://shelving.cc/util/duration/getHoursAgo
 */
export function getHoursAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getHoursAgo): number {
	return 0 - getHoursUntil(target, current, caller);
}

/**
 * Count the calendar days until a date.
 * - e.g. from 23:59 to 00:01 is 1 day, even though it's only 1 minutes.
 *
 * @param target Date to count up to.
 * @param current Date to count from (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getDaysUntil` itself).
 * @returns Number of calendar days from `current` to `target` (negative if `target` is in the past).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getDaysUntil(target) // 13
 * @see https://shelving.cc/util/duration/getDaysUntil
 */
export function getDaysUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getDaysUntil): number {
	return Math.round((getMidnight(target, caller).getTime() - getMidnight(current, caller).getTime()) / DAY);
}

/**
 * Count the calendar days since a date.
 * - Rounds to the nearest whole days.
 *
 * @param target Date to count back from.
 * @param current Date to count to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getDaysAgo` itself).
 * @returns Number of calendar days from `target` to `current` (negative if `target` is in the future).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getDaysAgo(target) // 13
 * @see https://shelving.cc/util/duration/getDaysAgo
 */
export function getDaysAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getDaysAgo): number {
	return 0 - getDaysUntil(target, current, caller);
}

/**
 * Count the whole weeks until a date.
 * - Rounds down to the nearest whole week, i.e.
 *
 * @param target Date to count up to.
 * @param current Date to count from (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getWeeksUntil` itself).
 * @returns Number of whole weeks from `current` to `target` (negative if `target` is in the past).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getWeeksUntil(target) // 9
 * @see https://shelving.cc/util/duration/getWeeksUntil
 */
export function getWeeksUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getWeeksUntil): number {
	return Math.trunc(getDaysUntil(target, current, caller) / 7);
}

/**
 * Count the whole weeks since a date.
 * - Rounds to the nearest whole week.
 *
 * @param target Date to count back from.
 * @param current Date to count to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getWeeksAgo` itself).
 * @returns Number of whole weeks from `target` to `current` (negative if `target` is in the future).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getWeeksAgo(target) // 9
 * @see https://shelving.cc/util/duration/getWeeksAgo
 */
export function getWeeksAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getWeeksAgo): number {
	return 0 - getWeeksUntil(target, current, caller);
}

/**
 * Count the calendar months until a date.
 * - e.g. from March 31st to April 1st is 1 month, even though it's only 1 day.
 *
 * @param target Date to count up to.
 * @param current Date to count from (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getMonthsUntil` itself).
 * @returns Number of calendar months from `current` to `target` (negative if `target` is in the past).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getMonthsUntil(target) // 14
 * @see https://shelving.cc/util/duration/getMonthsUntil
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
 *
 * @param target Date to count back from.
 * @param current Date to count to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getMonthsAgo` itself).
 * @returns Number of calendar months from `target` to `current` (negative if `target` is in the future).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getMonthsAgo(target) // 14
 * @see https://shelving.cc/util/duration/getMonthsAgo
 */
export function getMonthsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMonthsAgo): number {
	return 0 - getMonthsUntil(target, current, caller);
}

/**
 * Count the calendar years until a date.
 * - e.g. from December 31st to January 1st is 1 year, even though it's only 1 day.
 *
 * @param target Date to count up to.
 * @param current Date to count from (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getYearsUntil` itself).
 * @returns Number of calendar years from `current` to `target` (negative if `target` is in the past).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getYearsUntil(target) // 2
 * @see https://shelving.cc/util/duration/getYearsUntil
 */
export function getYearsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getYearsUntil): number {
	return requireDate(target, caller).getFullYear() - requireDate(current, caller).getFullYear();
}

/**
 * Count the calendar years since a date.
 * - Note this counts calendar years, not 365-day periods.
 * - e.g. from December 31st to January 1st is -1 years, even though it's only 1 day.
 *
 * @param target Date to count back from.
 * @param current Date to count to (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `getYearsAgo` itself).
 * @returns Number of calendar years from `target` to `current` (negative if `target` is in the future).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example getYearsAgo(target) // 2
 * @see https://shelving.cc/util/duration/getYearsAgo
 */
export function getYearsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getYearsAgo): number {
	return 0 - getYearsUntil(target, current, caller);
}

/**
 * Is a date in the past?
 *
 * @param target Date to test.
 * @param current Date to test against (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `isPast` itself).
 * @returns `true` if `target` is before `current`.
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example isPast("2000-01-01") // true
 * @see https://shelving.cc/util/duration/isPast
 */
export function isPast(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isPast): boolean {
	return getMilliseconds(current, target, caller) < 0;
}

/**
 * Is a date in the future?
 *
 * @param target Date to test.
 * @param current Date to test against (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `isFuture` itself).
 * @returns `true` if `target` is after `current`.
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example isFuture("2099-01-01") // true
 * @see https://shelving.cc/util/duration/isFuture
 */
export function isFuture(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isFuture): boolean {
	return getMilliseconds(current, target, caller) > 0;
}

/**
 * Is a date today (taking into account midnight).
 *
 * @param target Date to test.
 * @param current Date to test against (defaults to now).
 * @param caller Function to attribute a thrown error to (defaults to `isToday` itself).
 * @returns `true` if `target` falls on the same calendar day as `current`.
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example isToday(new Date()) // true
 * @see https://shelving.cc/util/duration/isToday
 */
export function isToday(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isToday): boolean {
	return getDaysUntil(target, current, caller) === 0;
}

/**
 * List of duration units (`millisecond` through `year`) keyed by unit reference.
 *
 * @see https://shelving.cc/util/duration/DURATION_UNITS
 */
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
/**
 * Key for one of the duration units in `DURATION_UNITS`.
 *
 * @see https://shelving.cc/util/duration/DurationUnitKey
 */
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
 *
 * @param ms Amount of time in milliseconds (the sign is ignored, only the magnitude matters).
 * @returns The best-fit `Unit` from `DURATION_UNITS` for the given magnitude.
 * @example getBestDurationUnit(90000).key // "minute"
 * @see https://shelving.cc/util/duration/getBestDurationUnit
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
 * Format a compact best-fit description of when a date happens or happened, e.g. `in 10d` or `2h ago` or `in 1w` or `just now`
 * - See `getBestDurationUnit()` for details on how the best-fit unit is chosen.
 * - But: anything under 30 seconds will show `just now`, which makes more sense in most UIs.
 *
 * @param target Date the duration is measured to.
 * @param current Date the duration is measured from (defaults to now).
 * @param options Formatting options for the chosen duration unit.
 * @param caller Function to attribute a thrown error to (defaults to `formatWhen` itself).
 * @returns Compact string like `in 10d`, `2h ago`, or `just now`.
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example formatWhen("2099-01-01") // "in 73 years"
 * @see https://shelving.cc/util/duration/formatWhen
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

/**
 * Format a compact best-fit description of how long until a date, e.g. `10d` or `2h` or `-1w`
 * - See `getBestDurationUnit()` for details on how the best-fit unit is chosen.
 *
 * @param target Date to count up to.
 * @param current Date to count from (defaults to now).
 * @param options Formatting options for the chosen duration unit.
 * @param caller Function to attribute a thrown error to (defaults to `formatUntil` itself).
 * @returns Compact string like `10d` or `2h` (negative if `target` is in the past).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example formatUntil("2099-01-01") // "73y"
 * @see https://shelving.cc/util/duration/formatUntil
 */
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

/**
 * Format a compact best-fit description of how long since a date, e.g. `10d` or `2h` or `-1w`
 * - See `getBestDurationUnit()` for details on how the best-fit unit is chosen.
 *
 * @param target Date to count back from.
 * @param current Date to count to (defaults to now).
 * @param options Formatting options for the chosen duration unit.
 * @param caller Function to attribute a thrown error to (defaults to `formatAgo` itself).
 * @returns Compact string like `10d` or `2h` (negative if `target` is in the future).
 * @throws {RequiredError} If `target` or `current` cannot be converted to a valid date.
 * @example formatAgo("2000-01-01") // "26y"
 * @see https://shelving.cc/util/duration/formatAgo
 */
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

/** Options for formatting a `DurationData` object with `formatDuration()`. */
interface DurationFormatOptions extends FormatOptions, Intl.DurationFormatOptions {}

/**
 * Format a duration as a string, e.g. `1 year, 2 months, 3 days` or `1y 2m 3d`
 *
 * @param duration `DurationData` object to format.
 * @param options Formatting options passed through to `Intl.DurationFormat`.
 * @returns Human-readable string describing the duration.
 * @example formatDuration({ years: 1, months: 2, days: 3 }) // "1 yr, 2 mths, 3 days"
 * @see https://shelving.cc/util/duration/formatDuration
 */
export function formatDuration(duration: DurationData, options?: DurationFormatOptions): string {
	return new Intl.DurationFormat(options?.locale, options).format(duration);
}
