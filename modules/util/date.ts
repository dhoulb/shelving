import { RequiredError } from "../error/RequiredError.js";
import { DAY, HOUR, MONTH, SECOND, WEEK } from "./constants.js";
import type { AnyFunction } from "./function.js";
import { TIME_UNITS, type TimeUnitKey, type Unit } from "./units.js";

/** Things that converted to dates. */
export type PossibleDate = "now" | "today" | "tomorrow" | "yesterday" | Date | number | string;

/** Is a value a date? */
export function isDate(value: unknown): value is Date {
	return value instanceof Date && Number.isFinite(value.getTime());
}

/** Assert that a value is a `Date` instance. */
export function assertDate(value: unknown): asserts value is Date {
	if (!isDate(value)) throw new RequiredError("Must be date", { received: value, caller: assertDate });
}

/**
 * Convert an unknown value to a valid `Date` instance, or return `undefined` if it couldn't be converted.
 * - Note: `Date` instances can be invalid (e.g. `new Date("blah blah").getTime()` returns `NaN`). These are detected and will always return `null`
 *
 * Conversion rules:
 * - `Date` instance returns unchanged (BUT if the date isn't valid, `undefined` is returned).
 * - `null` or `undefined` or `""` empty string returns `undefined`
 * - The string `"now"` returns the current date (e.g. `new Date()`).
 * - The string `"today"` returns the current date at midnight (e.g. `getMidnight()`).
 * - The string `"tomorrow"` returns tomorrow's date at midnight (e.g. `addDays(getMidnight(), 1)`).
 * - The string `"yesterday"` returns yesterday's date at midnight (e.g. `addDays(getMidnight(), 1)`).
 * - Strings (e.g. `"2003-09-12"` or `"2003 feb 20:09"`) return the corresponding date (using `new Date(string)`).
 * - Numbers are return the corresponding date (using `new Date(number)`, i.e. milliseconds since 01/01/1970).
 * - Anything else returns `undefined`
 *
 * @param possible Any value that we want to parse as a valid date (defaults to `undefined`).
 * @returns `Date` instance if the value could be converted to a valid date, and `null` if not.
 */
export function getDate(possible: unknown): Date | undefined {
	if (possible === undefined || possible === null || possible === "") return undefined;
	if (possible === "now") return new Date();
	if (possible === "today") return getMidnight();
	if (possible === "tomorrow") return addDays(1, getMidnight());
	if (possible === "yesterday") return addDays(-1, getMidnight());
	if (isDate(possible)) return possible;
	if (typeof possible === "string" || typeof possible === "number") {
		const date = new Date(possible);
		if (Number.isFinite(date.getTime())) return date;
	}
}

/**
 * Convert a possible date to a `Date` instance, or throw `RequiredError` if it couldn't be converted.
 * @param possible Any value that we want to parse as a valid date (defaults to `"now"`).
 */
export function requireDate(possible?: PossibleDate): Date {
	return _date(requireDate, possible);
}
export function _date(caller: AnyFunction, possible: PossibleDate = "now"): Date {
	const date = getDate(possible);
	if (!date) throw new RequiredError("Invalid date", { received: possible, caller });
	return date;
}

/** Convert an unknown value to a timestamp (milliseconds past Unix epoch), or `undefined` if it couldn't be converted. */
export function getTimestamp(possible?: unknown): number | undefined {
	return getDate(possible)?.getTime();
}

/** Convert a possible date to a timestamp (milliseconds past Unix epoch), or throw `RequiredError` if it couldn't be converted. */
export function requireTimestamp(possible?: PossibleDate): number {
	return _date(requireTimestamp, possible).getTime();
}

/** Convert an unknown value to a YMD date string like "2015-09-12", or `undefined` if it couldn't be converted. */
export function getYMD(possible?: unknown): string | undefined {
	const date = getDate(possible);
	if (date) return _ymd(date);
}

/** Convert a `Date` instance to a YMD string like "2015-09-12", or throw `RequiredError` if it couldn't be converted.  */
export function requireYMD(possible?: PossibleDate): string {
	return _ymd(_date(requireYMD, possible));
}
function _ymd(date: Date): string {
	const y = _pad(date.getUTCFullYear(), 4);
	const m = _pad(date.getUTCMonth() + 1, 2);
	const d = _pad(date.getUTCDate(), 2);
	return `${y}-${m}-${d}`;
}
function _pad(num: number, size: 2 | 3 | 4): string {
	return num.toString(10).padStart(size, "0000");
}

/** List of day-of-week strings. */
export const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

/** Type listing day-of-week strings. */
export type Day = (typeof DAYS)[number];

/** Convert a `Date` instance to a day-of-week string like "monday" */
export function getDay(target?: PossibleDate): Day {
	return DAYS[_date(getDay, target).getDay()] as Day;
}

/** Get a Date representing exactly midnight of the specified date. */
export function getMidnight(target?: PossibleDate): Date {
	return _getMidnight(getMidnight, target);
}
function _getMidnight(caller: AnyFunction, target?: PossibleDate): Date {
	const date = new Date(_date(caller, target)); // New instance, because we modify it.
	date.setHours(0, 0, 0, 0);
	return date;
}

/** Get a Date representing midnight on Monday of the specified week. */
export function getMonday(target?: PossibleDate): Date {
	const date = getMidnight(target); // New instance, because we modify it.
	const day = date.getDay();
	if (day === 0) date.setDate(date.getDate() - 6);
	else if (day !== 1) date.setDate(date.getDate() - (day - 1));
	return date;
}

/** Return a new date that increase or decreases the number of days based on an input date. */
export function addDays(change: number, target?: PossibleDate): Date {
	const date = new Date(_date(addDays, target)); // New instance, because we modify it.
	date.setDate(date.getDate() + change);
	return date;
}

/** Return a new date that increase or decreases the number of hours based on an input date. */
export function addHours(change: number, target?: PossibleDate): Date {
	const date = new Date(_date(addHours, target)); // New instance, because we modify it.
	date.setHours(date.getHours() + change);
	return date;
}

/**
 * Get the duration (in milliseconds) between two dates.
 *
 * @param target The date when the thing will happen or did happen.
 * @param current Today's date (or a different date to measure from).
 */
export function getMillisecondsUntil(target: PossibleDate, current?: PossibleDate): number {
	return _ms(getMillisecondsUntil, target, current);
}
function _ms(caller: AnyFunction, target: PossibleDate, current?: PossibleDate): number {
	return _date(caller, target).getTime() - _date(caller, current).getTime();
}

/** Count the number of seconds until a date. */
export function getSecondsUntil(target: PossibleDate, current?: PossibleDate): number {
	return _ms(getSecondsUntil, target, current) / SECOND;
}

/** Count the number of days ago a date was. */
export function getSecondsAgo(target: PossibleDate, current?: PossibleDate): number {
	return 0 - _ms(getSecondsUntil, target, current) / SECOND;
}

/** Count the number of days until a date. */
export function getDaysUntil(target: PossibleDate, current?: PossibleDate): number {
	return _days(getDaysUntil, target, current);
}
function _days(caller: AnyFunction, target: PossibleDate, current?: PossibleDate): number {
	return Math.round((_date(caller, target).getTime() - _date(caller, current).getTime()) / DAY);
}

/** Count the number of days ago a date was. */
export function getDaysAgo(target: PossibleDate, current?: PossibleDate): number {
	return 0 - _days(getDaysAgo, target, current);
}

/** Count the number of weeks until a date. */
export function getWeeksUntil(target: PossibleDate, current?: PossibleDate): number {
	return Math.floor(_days(getWeeksUntil, target, current) / 7);
}

/** Count the number of weeks ago a date was. */
export function getWeeksAgo(target: PossibleDate, current?: PossibleDate): number {
	return 0 - Math.floor(_days(getWeeksUntil, target, current) / 7);
}

/** Is a date in the past? */
export function isPast(target: PossibleDate, current?: PossibleDate): boolean {
	return _ms(isPast, target, current) < 0;
}

/** Is a date in the future? */
export function isFuture(target: PossibleDate, current?: PossibleDate): boolean {
	return _ms(isFuture, target, current) > 0;
}

/** Is a date today (taking into account midnight). */
export function isToday(target: PossibleDate, current?: PossibleDate): boolean {
	return _days(isToday, target, current) === 0;
}

/** Format a date in the browser locale. */
export function formatDate(date?: PossibleDate): string {
	return _date(formatDate, date).toLocaleDateString();
}

/** Get an appropriate time unit based on an amount in milliseconds. */
function _getBestTimeUnit(ms: number): Unit<TimeUnitKey> {
	const abs = Math.abs(ms);
	if (abs > 18 * MONTH) return TIME_UNITS.require("year");
	if (abs > 10 * WEEK) return TIME_UNITS.require("month");
	if (abs > 2 * WEEK) return TIME_UNITS.require("week");
	if (abs > DAY) return TIME_UNITS.require("day");
	if (abs > HOUR) return TIME_UNITS.require("hour");
	if (abs > 9949) return TIME_UNITS.require("minute");
	if (abs > SECOND) return TIME_UNITS.require("second");
	return TIME_UNITS.require("millisecond");
}

/** Compact when a date happens/happened, e.g. `in 10d` or `2h ago` or `in 1w` or `just now` */
export function formatWhen(target: PossibleDate, current?: PossibleDate, options?: Intl.NumberFormatOptions): string {
	const ms = _ms(formatWhen, target, current);
	const abs = Math.abs(ms);
	if (abs < 30 * SECOND) return "just now";
	const unit = _getBestTimeUnit(ms);
	return ms > 0 ? `in ${unit.format(unit.from(abs), options)}` : `${unit.format(unit.from(abs), options)} ago`;
}

/** Compact when a date happens, e.g. `10d` or `2h` or `-1w` */
export function formatUntil(target: PossibleDate, current?: PossibleDate, options?: Intl.NumberFormatOptions): string {
	const ms = _ms(formatUntil, target, current);
	const unit = _getBestTimeUnit(ms);
	return unit.format(unit.from(ms), options);
}

/** Compact when a date will happen, e.g. `10d` or `2h` or `-1w` */
export function formatAgo(target: PossibleDate, current?: PossibleDate, options?: Intl.NumberFormatOptions): string {
	const ms = 0 - _ms(formatAgo, target, current);
	const unit = _getBestTimeUnit(ms);
	return unit.format(unit.from(ms), options);
}
