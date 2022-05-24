import { AssertionError } from "../error/AssertionError.js";

/** Is a value a date? */
export const isDate = (v: unknown): v is Date => v instanceof Date;

/** Assert that a value is a `Date` instance. */
export function assertDate(v: unknown): asserts v is Date {
	if (!(v instanceof Date)) throw new AssertionError(`Must be date`, v);
}

/** Value that can possibly be converted to a `Date` instance. */
export type PossibleDate = Date | number | string | (() => PossibleDate);
export type PossibleOptionalDate = Date | number | string | null | (() => PossibleDate | null);

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
 * @param target Any value that we want to parse as a valid date.
 * @returns `Date` instance if the value could be converted to a valid date, and `null` if not.
 */
export function toDate(target: unknown): Date | null {
	if (target === undefined || target === "now") return new Date();
	if (target instanceof Date) return !Number.isNaN(target.getTime()) ? target : null;
	if (target === "today") return getMidnight();
	if (target === "tomorrow") return addDays(1, getMidnight());
	if (target === "yesterday") return addDays(-1, getMidnight());
	if (target === null || target === "") return null; // We know empty string is always an invalid date.
	if (typeof target === "string" || typeof target === "number") return toDate(new Date(target));
	if (typeof target === "function") return toDate(target());
	return null;
}

/** Convert a possible date to a `Date` instance, or throw `AssertionError` if it couldn't be converted. */
export function getDate(target: PossibleDate = "now"): Date {
	const date = toDate(target);
	assertDate(date);
	return date;
}

/** Convert an unknown value to a YMD date string like "2015-09-12", or `null` if it couldn't be converted. */
export function toYmd(target: unknown): string | null {
	const date = toDate(target);
	return date ? date.toISOString().slice(0, 10) : null;
}

/** Convert a `Date` instance to a YMD string like "2015-09-12", or throw `AssertionError` if it couldn't be converted.  */
export function getYmd(target: PossibleDate = "now"): string {
	return getDate(target).toISOString().slice(0, 10);
}

/** List of day-of-week strings. */
export const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

/** Type listing day-of-week strings. */
export type Day = typeof days[number];

/** Convert a `Date` instance to a day-of-week string like "monday" */
export const getDay = (target?: PossibleDate): Day => days[getDate(target).getDay()] as Day;

/** Get a Date representing exactly midnight of the specified date. */
export function getMidnight(target?: PossibleDate): Date {
	const date = new Date(getDate(target)); // New instance, because we modify it.
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
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

/** Format a date in the browser locale. */
export const formatDate = (date: PossibleDate): string => _formatter.format(getDate(date));
const _formatter = new Intl.DateTimeFormat(undefined, {});

/** Is a date in the past? */
export const isPast = (target: PossibleDate, current?: PossibleDate): boolean => getDate(target) < getDate(current);

/** Is a date in the future? */
export const isFuture = (target: PossibleDate, current?: PossibleDate): boolean => getDate(target) > getDate(current);

/** Is a date today (taking into account midnight). */
export const isToday = (target: PossibleDate, current?: PossibleDate): boolean => getMidnight(target) === getMidnight(current);
