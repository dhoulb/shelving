import { ValueError } from "../error/ValueError.js";

/** Things that converted to dates. */
export type PossibleDate = Date | number | string;

/** Is a value a date? */
export function isDate(value: unknown): value is Date {
	return value instanceof Date && Number.isFinite(value.getTime());
}

/** Assert that a value is a `Date` instance. */
export function assertDate(value: unknown): asserts value is Date {
	if (!isDate(value)) throw new ValueError(`Must be date`, value);
}

/**
 * Convert an unknown value to a valid `Date` instance, or `null` if it couldn't be converted.
 * - Note: `Date` instances can be invalid (e.g. `new Date("blah blah").getTime()` returns `NaN`). These are detected and will always return `null`
 *
 * Conversion rules:
 * - `Date` instance returns unchanged (BUT if the date isn't valid, `null` is returned).
 * - `null` or `""` empty string or the string `"none"` returns `undefined`
 * - `undefined` returns the current date (e.g. `new Date()`).
 * - The string `"now"` returns the current date (e.g. `new Date()`).
 * - The string `"today"` returns the current date at midnight (e.g. `getMidnight()`).
 * - The string `"tomorrow"` returns tomorrow's date at midnight (e.g. `addDays(getMidnight(), 1)`).
 * - The string `"yesterday"` returns yesterday's date at midnight (e.g. `addDays(getMidnight(), 1)`).
 * - Strings (e.g. `"2003-09-12"` or `"2003 feb 20:09"`) return the corresponding date (using `new Date(string)`).
 * - Numbers are return the corresponding date (using `new Date(number)`, i.e. milliseconds since 01/01/1970).
 * - Anything else is converted to `null`
 *
 * @param possible Any value that we want to parse as a valid date.
 * @returns `Date` instance if the value could be converted to a valid date, and `null` if not.
 */
export function getOptionalDate(possible: unknown = "now"): Date | undefined {
	if (possible === null) return undefined;
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

/** Convert a possible date to a `Date` instance, or throw `ValueError` if it couldn't be converted. */
export function getDate(possible?: PossibleDate): Date {
	const date = getOptionalDate(possible);
	if (!date) throw new ValueError(`Invalid date`, possible);
	return date;
}

/** Convert an unknown value to a timestamp (milliseconds past Unix epoch), or `undefined` if it couldn't be converted. */
export function getOptionalTimestamp(possible: unknown): number | undefined {
	return getOptionalDate(possible)?.getTime();
}

/** Convert a possible date to a timestamp (milliseconds past Unix epoch), or throw `ValueError` if it couldn't be converted. */
export function getTimestamp(possible?: PossibleDate): number {
	return getDate(possible).getTime();
}

/** Convert an unknown value to a YMD date string like "2015-09-12", or `undefined` if it couldn't be converted. */
export function getOptionalYMD(possible: unknown): string | undefined {
	const date = getOptionalDate(possible);
	if (date) return _ymd(date);
}

/** Convert a `Date` instance to a YMD string like "2015-09-12", or throw `ValueError` if it couldn't be converted.  */
export function getYMD(possible?: PossibleDate): string {
	return _ymd(getDate(possible));
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
	return DAYS[getDate(target).getDay()] as Day;
}

/** Get a Date representing exactly midnight of the specified date. */
export function getMidnight(target?: PossibleDate): Date {
	const date = new Date(getDate(target)); // New instance, because we modify it.
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
	const date = new Date(getDate(target)); // New instance, because we modify it.
	date.setDate(date.getDate() + change);
	return date;
}

/** Return a new date that increase or decreases the number of hours based on an input date. */
export function addHours(change: number, target?: PossibleDate): Date {
	const date = new Date(getDate(target)); // New instance, because we modify it.
	date.setHours(date.getHours() + change);
	return date;
}

/**
 * Get the duration (in milliseconds) between two dates.
 *
 * @param target The date when the thing will happen or did happen.
 * @param current Today's date (or a different date to measure from).
 */
export function getDuration(target?: PossibleDate, current?: PossibleDate): number {
	return getDate(target).getTime() - getDate(current).getTime();
}

/** Count the number of seconds until a date. */
export function getSecondsUntil(target: PossibleDate, current?: PossibleDate): number {
	return getDuration(target, current) / 1000;
}

/** Count the number of days ago a date was. */
export function getSecondsAgo(target: PossibleDate, current?: PossibleDate): number {
	return 0 - getSecondsUntil(target, current);
}

/** Count the number of days until a date. */
export function getDaysUntil(target: PossibleDate, current?: PossibleDate): number {
	return Math.round((getMidnight(target).getTime() - getMidnight(current).getTime()) / 86400000);
}

/** Count the number of days ago a date was. */
export function getDaysAgo(target: PossibleDate, current?: PossibleDate): number {
	return 0 - getDaysUntil(target, current);
}

/** Count the number of weeks until a date. */
export function getWeeksUntil(target: PossibleDate, current?: PossibleDate): number {
	return Math.floor(getDaysUntil(target, current) / 7);
}

/** Count the number of weeks ago a date was. */
export function getWeeksAgo(target: PossibleDate, current?: PossibleDate): number {
	return 0 - getWeeksUntil(target, current);
}

/** Is a date in the past? */
export function isPast(target: PossibleDate, current?: PossibleDate): boolean {
	return getDate(target) < getDate(current);
}

/** Is a date in the future? */
export function isFuture(target: PossibleDate, current?: PossibleDate): boolean {
	return getDate(target) > getDate(current);
}

/** Is a date today (taking into account midnight). */
export function isToday(target: PossibleDate, current?: PossibleDate): boolean {
	return getMidnight(target) === getMidnight(current);
}

/** Format a date in the browser locale. */
export function formatDate(date: PossibleDate): string {
	return getDate(date).toLocaleDateString();
}

/** Format an optional time as a string. */
export function formatOptionalDate(date?: unknown): string | undefined {
	return getOptionalDate(date)?.toLocaleDateString();
}
