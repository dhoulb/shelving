import { AssertionError } from "../error/AssertionError.js";

/** Things that converted to dates. */
export type PossibleDate = Date | number | string | (() => Date | number | string);

/** Things that converted to dates or `null` */
export type PossibleOptionalDate = Date | number | string | null | (() => Date | number | string | null | null);

/** Is a value a date? */
export const isDate = (v: Date | unknown): v is Date => v instanceof Date;

/** Assert that a value is a `Date` instance. */
export function assertDate(v: Date | unknown): asserts v is Date {
	if (!isDate(v)) throw new AssertionError(`Must be date`, v);
}

/**
 * Convert an unknown value to a `Date` instance, or `null` if it couldn't be converted.
 *- Note: `Date` instances can be invalid (i.e. `date.getTime()` returns `NaN`). These are detected and will always return `null`
 *
 * Conversion rules:
 * - `Date` instance returns unchanged (BUT if the date isn't valid, `null` is returned).
 * - `null` returns `null`
 * - `undefined` returns the current date (e.g. `new Date()`).
 * - The string `"now"` returns the current date (e.g. `new Date()`).
 * - The string `"today"` returns the current date at midnight (e.g. `getMidnight()`).
 * - The string `"tomorrow"` returns tomorrow's date at midnight (e.g. `addDays(getMidnight(), 1)`).
 * - The string `"yesterday"` returns yesterday's date at midnight (e.g. `addDays(getMidnight(), 1)`).
 * - Strings (e.g. `"2003-09-12"` or `"2003 feb 20:09"`) return the corresponding date (using `new Date(string)`).
 * - Numbers are return the corresponding date (using `new Date(number)`, i.e. milliseconds since 01/01/1970).
 * - Anything else is converted to `null`
 *
 * @param possibleDate Any value that we want to parse as a valid date.
 * @returns `Date` instance if the value could be converted to a valid date, and `null` if not.
 */
export function getOptionalDate(possibleDate: unknown): Date | null {
	if (possibleDate === undefined || possibleDate === "now") return new Date();
	if (isDate(possibleDate)) return !Number.isNaN(possibleDate.getTime()) ? possibleDate : null;
	if (possibleDate === "today") return getMidnight();
	if (possibleDate === "tomorrow") return addDays(1, getMidnight());
	if (possibleDate === "yesterday") return addDays(-1, getMidnight());
	if (possibleDate === null || possibleDate === "") return null; // We know empty string is always an invalid date.
	if (typeof possibleDate === "string" || typeof possibleDate === "number") return getOptionalDate(new Date(possibleDate));
	if (typeof possibleDate === "function") return getOptionalDate(possibleDate());
	return null;
}

/** Convert a possible date to a `Date` instance, or throw `AssertionError` if it couldn't be converted. */
export function getDate(possibleDate: PossibleDate = "now"): Date {
	const date = getOptionalDate(possibleDate);
	if (!date) throw new AssertionError(`Must be date`, possibleDate);
	return date;
}

/** Convert an unknown value to a YMD date string like "2015-09-12", or `null` if it couldn't be converted. */
export function getOptionalYmd(possibleDate: unknown): string | null {
	const date = getOptionalDate(possibleDate);
	return date ? date.toISOString().slice(0, 10) : null;
}

/** Convert a `Date` instance to a YMD string like "2015-09-12", or throw `AssertionError` if it couldn't be converted.  */
export function getYmd(possibleDate: PossibleDate = "now"): string {
	const date = getDate(possibleDate);
	const y = _pad(date.getUTCFullYear(), 4);
	const m = _pad(date.getUTCMonth() + 1, 2);
	const d = _pad(date.getUTCDate(), 2);
	return `${y}-${m}-${d}`;
}
const _pad = (num: number, size: 2 | 3 | 4): string => num.toString(10).padStart(size, "0000");

/** List of day-of-week strings. */
export const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

/** Type listing day-of-week strings. */
export type Day = typeof days[number];

/** Convert a `Date` instance to a day-of-week string like "monday" */
export const getDay = (target?: PossibleDate): Day => days[getDate(target).getDay()] as Day;

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
export const getDuration = (target?: PossibleDate, current?: PossibleDate): number => getDate(target).getTime() - getDate(current).getTime();

/** Count the number of seconds until a date. */
export const getSecondsUntil = (target: PossibleDate, current?: PossibleDate): number => getDuration(target, current) / 1000;

/** Count the number of days ago a date was. */
export const getSecondsAgo = (target: PossibleDate, current?: PossibleDate): number => 0 - getSecondsUntil(target, current);

/** Count the number of days until a date. */
export const getDaysUntil = (target: PossibleDate, current?: PossibleDate): number => Math.round((getMidnight(target).getTime() - getMidnight(current).getTime()) / 86400000);

/** Count the number of days ago a date was. */
export const getDaysAgo = (target: PossibleDate, current?: PossibleDate): number => 0 - getDaysUntil(target, current);

/** Count the number of weeks until a date. */
export const getWeeksUntil = (target: PossibleDate, current?: PossibleDate): number => Math.floor(getDaysUntil(target, current) / 7);

/** Count the number of weeks ago a date was. */
export const getWeeksAgo = (target: PossibleDate, current?: PossibleDate): number => 0 - getWeeksUntil(target, current);

/** Is a date in the past? */
export const isPast = (target: PossibleDate, current?: PossibleDate): boolean => getDate(target) < getDate(current);

/** Is a date in the future? */
export const isFuture = (target: PossibleDate, current?: PossibleDate): boolean => getDate(target) > getDate(current);

/** Is a date today (taking into account midnight). */
export const isToday = (target: PossibleDate, current?: PossibleDate): boolean => getMidnight(target) === getMidnight(current);

/** Format a date in the browser locale. */
export const formatDate = (date: PossibleDate): string => getDate(date).toLocaleDateString();

/** Format an optional time as a string. */
export const formatOptionalDate = (date?: unknown): string | null => getOptionalDate(date)?.toLocaleDateString() || null;
