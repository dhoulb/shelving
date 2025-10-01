import { RequiredError } from "../error/RequiredError.js";
import { DAY, HOUR, MONTH, SECOND, WEEK } from "./constants.js";
import type { AnyCaller } from "./function.js";
import { TIME_UNITS, type TimeUnitKey, type Unit } from "./units.js";

/** Values that can be converted to dates. */
export type PossibleDate = "now" | "today" | "tomorrow" | "yesterday" | Date | number | string;

/**
 * Is a value a valid date?
 * - Note: `Date` instances can be invalid (e.g. `new Date("blah blah").getTime()` returns `NaN`). These are detected and will always return `false`
 */
export function isDate(value: unknown): value is Date {
	return value instanceof Date && Number.isFinite(value.getTime());
}

/** Assert that a value is a `Date` instance. */
export function assertDate(value: unknown, caller: AnyCaller = assertDate): asserts value is Date {
	if (!isDate(value)) throw new RequiredError("Must be valid date", { received: value, caller });
}

/**
 * Convert an unknown value to a valid `Date` instance, or return `undefined` if it couldn't be converted.
 * - Note: `Date` instances can be invalid (e.g. `new Date("blah blah").getTime()` returns `NaN`). These are detected and will always return `null`
 *
 * @param value Any value that we want to parse as a valid date (defaults to `undefined`).
 * - `Date` instance returns unchanged (BUT if the date isn't valid, `undefined` is returned).
 * - `null` or `undefined` or `""` empty string returns `undefined`
 * - The string `"now"` returns the current date (e.g. `new Date()`).
 * - The string `"today"` returns the current date at midnight (e.g. `getMidnight()`).
 * - The string `"tomorrow"` returns tomorrow's date at midnight (e.g. `addDays(getMidnight(), 1)`).
 * - The string `"yesterday"` returns yesterday's date at midnight (e.g. `addDays(getMidnight(), 1)`).
 * - Date strings (e.g. `"2003-09-12"` or `"2003 feb 20:09"`) return the corresponding date (using the user's current locale).
 * - Time strings (e.g. `"18:32"` or `"23:59:59.999"`) return today's date at that time (using the user's current locale).
 * - Numbers are return the corresponding date (using `new Date(number)`, i.e. milliseconds since 01/01/1970).
 * - Anything else returns `undefined`
 *
 * @returns `Date` instance if the value could be converted to a valid date, and `null` if not.
 */
export function getDate(value: unknown): Date | undefined {
	if (value === "now") return getNow();
	if (value === "yesterday") return getYesterday();
	if (value === "today") return getToday();
	if (value === "tomorrow") return getTomorrow();
	if (isDate(value)) return value;
	if (typeof value === "string" || typeof value === "number") {
		const date = new Date(value);
		if (Number.isFinite(date.getTime())) return date;
		const time = new Date(`${requireDateString()}T${value}`);
		if (Number.isFinite(time.getTime())) return time;
	}
}

/** Get a date representing this exact moment. */
export function getNow(): Date {
	return new Date();
}

/** Get a date representing midnight of the previous day. */
export function getYesterday(): Date {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() - 1);
	return date;
}

/** Get a date representing midnight of the current day. */
export function getToday(): Date {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
}

/** Get a date representing midnight of the next day. */
export function getTomorrow(): Date {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + 1);
	return date;
}

/**
 * Convert a possible date to a `Date` instance, or throw `RequiredError` if it couldn't be converted.
 * @param value Any value that we want to parse as a valid date (defaults to `"now"`).
 */
export function requireDate(value: PossibleDate = "now", caller: AnyCaller = requireDate): Date {
	const date = getDate(value);
	assertDate(date, caller);
	return date;
}

/** Convert an unknown value to a timestamp (milliseconds past Unix epoch), or `undefined` if it couldn't be converted. */
export function getTimestamp(value?: unknown): number | undefined {
	return getDate(value)?.getTime();
}

/** Convert a possible date to a timestamp (milliseconds past Unix epoch), or throw `RequiredError` if it couldn't be converted. */
export function requireTimestamp(value?: PossibleDate): number {
	return requireDate(value, requireTimestamp).getTime();
}

// Helpers.
function _pad(num: number, length = 2): string {
	return num.toString().padStart(length, "0");
}
function _date(date: Date): string {
	return `${_pad(date.getFullYear(), 4)}-${_pad(date.getMonth() + 1)}-${_pad(date.getDate())}`;
}
function _time(date: Date): string {
	return `${_pad(date.getHours())}:${_pad(date.getMinutes())}:${_pad(date.getSeconds())}`;
}
function _datetime(date: Date): string {
	return `${_date(date)}T${_time(date)}`;
}

/** Convert an unknown value to a local date string like "2015-09-12T18:30:00", or `undefined` if it couldn't be converted. */
export function getDateTimeString(value?: unknown): string | undefined {
	const date = getDate(value);
	if (date) return _datetime(date);
}

/** Convert a possible `Date` instance to a local YMD string like "2015-09-12T18:30:00", or throw `RequiredError` if it couldn't be converted.  */
export function requireDateTimeString(value?: PossibleDate, caller: AnyCaller = requireDateTimeString): string {
	return _datetime(requireDate(value, caller));
}

/** Convert an unknown value to a local date string like "2015-09-12", or `undefined` if it couldn't be converted. */
export function getDateString(value?: unknown): string | undefined {
	const date = getDate(value);
	if (date) return _date(date);
}

/** Convert a possible `Date` instance to a local date string like "2015-09-12", or throw `RequiredError` if it couldn't be converted.  */
export function requireDateString(value?: PossibleDate, caller: AnyCaller = requireDateString): string {
	return _date(requireDate(value, caller));
}

/** Convert an unknown value to a local time string like "18:32:00", or `undefined` if it couldn't be converted. */
export function getTimeString(value?: unknown): string | undefined {
	const date = getDate(value);
	if (date) return _time(date);
}

/** Convert a possible `Date` instance to local time string like "18:32:00", or throw `RequiredError` if it couldn't be converted. */
export function requireTimeString(value?: PossibleDate, caller: AnyCaller = requireTimeString): string {
	return _time(requireDate(value, caller));
}
/** List of day-of-week strings. */
export const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

/** Type listing day-of-week strings. */
export type Day = (typeof DAYS)[number];

/** Convert a `Date` instance to a day-of-week string like "monday" */
export function getDay(target?: PossibleDate): Day {
	return DAYS[requireDate(target, getDay).getDay()] as Day;
}

/** Get a Date representing exactly midnight of the specified date. */
export function getMidnight(target?: PossibleDate, caller: AnyCaller = getMidnight): Date {
	const date = new Date(requireDate(target, caller)); // New instance, because we modify it.
	date.setHours(0, 0, 0, 0);
	return date;
}

/** Get a Date representing midnight on Monday of the specified week. */
export function getMonday(target?: PossibleDate, caller: AnyCaller = getMonday): Date {
	const date = getMidnight(target, caller); // New instance, because we modify it.
	const day = date.getDay();
	if (day === 0) date.setDate(date.getDate() - 6);
	else if (day !== 1) date.setDate(date.getDate() - (day - 1));
	return date;
}

/** Return a new date that increase or decreases the number of days based on an input date. */
export function addDays(change: number, target?: PossibleDate): Date {
	const date = new Date(requireDate(target, addDays)); // New instance, because we modify it.
	date.setDate(date.getDate() + change);
	return date;
}

/** Return a new date that increase or decreases the number of hours based on an input date. */
export function addHours(change: number, target?: PossibleDate): Date {
	const date = new Date(requireDate(target, addHours)); // New instance, because we modify it.
	date.setHours(date.getHours() + change);
	return date;
}

/**
 * Get the duration (in milliseconds) between two dates.
 *
 * @param target The date when the thing will happen or did happen.
 * @param current Today's date (or a different date to measure from).
 */
export function getMillisecondsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getMillisecondsUntil): number {
	return requireDate(target, caller).getTime() - requireDate(current, caller).getTime();
}

/** Count the number of seconds until a date. */
export function getSecondsUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getSecondsUntil): number {
	return getMillisecondsUntil(target, current, caller) / SECOND;
}

/** Count the number of days ago a date was. */
export function getSecondsAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getSecondsAgo): number {
	return 0 - getSecondsUntil(target, current, caller);
}

/** Count the number of days until a date. */
export function getDaysUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getDaysUntil): number {
	return Math.round((requireDate(target, caller).getTime() - requireDate(current, caller).getTime()) / DAY);
}

/** Count the number of days ago a date was. */
export function getDaysAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getDaysAgo): number {
	return 0 - getDaysUntil(target, current, caller);
}

/** Count the number of weeks until a date. */
export function getWeeksUntil(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getWeeksUntil): number {
	return Math.floor(getDaysUntil(target, current, caller) / 7);
}

/** Count the number of weeks ago a date was. */
export function getWeeksAgo(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = getWeeksAgo): number {
	return 0 - getWeeksUntil(target, current, caller);
}

/** Is a date in the past? */
export function isPast(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isPast): boolean {
	return getMillisecondsUntil(target, current, caller) < 0;
}

/** Is a date in the future? */
export function isFuture(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isFuture): boolean {
	return getMillisecondsUntil(target, current, caller) > 0;
}

/** Is a date today (taking into account midnight). */
export function isToday(target: PossibleDate, current?: PossibleDate, caller: AnyCaller = isToday): boolean {
	return getDaysUntil(target, current, caller) === 0;
}

/** Get an appropriate time unit based on an amount in milliseconds. */
function getBestTimeUnit(ms: number): Unit<TimeUnitKey> {
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
	const ms = getMillisecondsUntil(target, current, formatWhen);
	const abs = Math.abs(ms);
	if (abs < 30 * SECOND) return "just now";
	const unit = getBestTimeUnit(ms);
	return ms > 0 ? `in ${unit.format(unit.from(abs), options)}` : `${unit.format(unit.from(abs), options)} ago`;
}

/** Compact when a date happens, e.g. `10d` or `2h` or `-1w` */
export function formatUntil(target: PossibleDate, current?: PossibleDate, options?: Intl.NumberFormatOptions): string {
	const ms = getMillisecondsUntil(target, current, formatUntil);
	const unit = getBestTimeUnit(ms);
	return unit.format(unit.from(ms), options);
}

/** Compact when a date will happen, e.g. `10d` or `2h` or `-1w` */
export function formatAgo(target: PossibleDate, current?: PossibleDate, options?: Intl.NumberFormatOptions): string {
	const ms = 0 - getMillisecondsUntil(target, current, formatAgo);
	const unit = getBestTimeUnit(ms);
	return unit.format(unit.from(ms), options);
}
