import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

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

/** Get a Date representing exactly midnight of the specified date. */
export function getMidnight(target?: PossibleDate, caller: AnyCaller = getMidnight): Date {
	const date = new Date(requireDate(target, caller));
	date.setHours(0, 0, 0, 0);
	return date;
}

/** Get a Date representing midnight on Monday of the specified week. */
export function getMonday(target?: PossibleDate, caller: AnyCaller = getMonday): Date {
	const date = getMidnight(target, caller);
	const day = date.getDay();
	if (day === 0) date.setDate(date.getDate() - 6);
	else if (day !== 1) date.setDate(date.getDate() - (day - 1));
	return date;
}

/** Get a Date representing the first day of the specified month. */
export function getMonthStart(target?: PossibleDate, caller: AnyCaller = getMonthStart): Date {
	const date = getMidnight(target, caller);
	date.setDate(1);
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
export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** Type listing day-of-week strings. */
export type Day = (typeof DAYS)[number];

/** Convert a `Date` instance to a day-of-week string like "Monday" */
export function getDay(target?: PossibleDate): Day {
	return DAYS[requireDate(target, getDay).getDay()] as Day;
}

/**
 * Return a new date that increase or decreases the month based on an input date.
 * - February 29th is a special cased and is _rounded down_ to February 28th on non-leap years.
 */
export function addYears(change: number, target?: PossibleDate, caller: AnyCaller = addYears): Date {
	const input = requireDate(target, caller);
	const output = new Date(input);
	output.setFullYear(output.getFullYear() + change);
	if (input.getMonth() !== output.getMonth()) output.setDate(0); // Handle February 29th case.
	return output;
}

/**
 * Return a new date that increase or decreases the month based on an input date.
 * - Note that with Javascript "rollover" semantics, adding a month when we're on e.g. 31st of August would normally roll _past_ September and return 1st October.
 * - To avoid this we clamp the date to the end of the month if rollover happens.
 */
export function addMonths(change: number, target?: PossibleDate, caller: AnyCaller = addMonths): Date {
	const input = requireDate(target, caller);
	const output = new Date(input);
	output.setMonth(output.getMonth() + change);
	if (input.getMonth() !== output.getMonth() + change) output.setDate(0); // Handle 31st rollover case.
	return output;
}

/** Return a new date that increase or decreases the week based on an input date. */
export function addWeeks(change: number, target?: PossibleDate, caller: AnyCaller = addWeeks): Date {
	const date = new Date(requireDate(target, caller));
	date.setDate(date.getDate() + change * 7);
	return date;
}

/** Return a new date that increase or decreases the day based on an input date. */
export function addDays(change: number, target?: PossibleDate, caller: AnyCaller = addDays): Date {
	const date = new Date(requireDate(target, caller));
	date.setDate(date.getDate() + change);
	return date;
}

/** Return a new date that increase or decreases the hour based on an input date. */
export function addHours(change: number, target?: PossibleDate, caller: AnyCaller = addHours): Date {
	const date = new Date(requireDate(target, caller));
	date.setHours(date.getHours() + change);
	return date;
}

/** Return a new date that increase or decreases the minute based on an input date. */
export function addMinutes(change: number, target?: PossibleDate, caller: AnyCaller = addMinutes): Date {
	const date = new Date(requireDate(target, caller));
	date.setMinutes(date.getMinutes() + change);
	return date;
}

/** Return a new date that increase or decreases the minute based on an input date. */
export function addSeconds(change: number, target?: PossibleDate, caller: AnyCaller = addSeconds): Date {
	const date = new Date(requireDate(target, caller));
	date.setSeconds(date.getSeconds() + change);
	return date;
}

/** Return a new date that increase or decreases the minute based on an input date. */
export function addMilliseconds(change: number, target?: PossibleDate, caller: AnyCaller = addMilliseconds): Date {
	const date = new Date(requireDate(target, caller));
	date.setMilliseconds(date.getMilliseconds() + change);
	return date;
}
