import { AssertionError } from "./error.js";
import { formatNumber } from "./number.js";

/** One minute in millseconds. */
export const MINUTE = 60 * 1000;

/** One hour in millseconds. */
export const HOUR = MINUTE * 60;

/** One day in millseconds. */
export const DAY = HOUR * 24;

/** One week in millseconds. */
export const WEEK = DAY * 7;

/** One year in millseconds. */
export const YEAR = DAY * 365;

/** Is a value a date? */
export const isDate = (v: unknown): v is Date => v instanceof Date;

/** Value that can possibly be converted to a `Date` instance. */
export type PossibleDate = Date | number | string | (() => PossibleDate);
export type PossibleOptionalDate = Date | number | string | null | (() => PossibleDate | null);

/**
 * Convert an unknown value to a `Date` instance or `null`
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
 * @param value Any value that we want to parse as a valid date.
 * @returns `Date` instance if the value could be converted to a valid date, and `null` if not.
 */
export const toDate = (value: unknown): Date | null => {
	if (value === undefined || value === "now") return new Date();
	if (value instanceof Date) return !Number.isNaN(value.getTime()) ? value : null;
	if (value === "today") return getMidnight();
	if (value === "tomorrow") return addDays(1, getMidnight());
	if (value === "yesterday") return addDays(-1, getMidnight());
	if (value === null || value === "") return null; // We know empty string is always an invalid date.
	if (typeof value === "string" || typeof value === "number") return toDate(new Date(value));
	if (typeof value === "function") return toDate(value());
	return null;
};

/**
 * Convert a possible date to a `Date` instance.
 * - See `parseDate()` for conversion rules.
 *
 * @throws Error If the value can't be converted to a date.
 */
export const getDate = (target: PossibleDate = new Date()): Date => {
	const date = toDate(target);
	if (date) return date;
	throw new AssertionError("Invalid date", target); // Error if date could not be converted to date.
};

/** Convert an unknown value to a YMD date string or `null` if it couldn't be converted. */
export const toYmd = (value: unknown): string | null => {
	const date = toDate(value);
	return date ? date.toISOString().substr(0, 10) : null;
};

/** Convert a `Date` instance to a YMD string like "2015-09-12" */
export const getYmd = (target?: PossibleDate): string => getDate(target).toISOString().substr(0, 10);

/** List of day-of-week strings. */
export const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

/** Type listing day-of-week strings. */
export type Day = typeof days[number];

/** Convert a `Date` instance to a day-of-week string like "monday" */
export const getDay = (target?: PossibleDate): Day => days[getDate(target).getDay()] as Day;

/** Get a Date representing exactly midnight of the specified date. */
export const getMidnight = (target?: PossibleDate): Date => {
	const date = new Date(getDate(target)); // New instance, because we modify it.
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
};

/** Get a Date representing midnight on Monday of the specified week. */
export const getMonday = (target?: PossibleDate): Date => {
	const date = getMidnight(target); // New instance, because we modify it.
	const day = date.getDay();
	if (day === 0) date.setDate(date.getDate() - 6);
	else if (day !== 1) date.setDate(date.getDate() - (day - 1));
	return date;
};

/** Return a new date that increase or decreases the number of days based on an input date. */
export const addDays = (change: number, target?: PossibleDate): Date => {
	const date = new Date(getDate(target)); // New instance, because we modify it.
	date.setDate(date.getDate() + change);
	return date;
};

/** Return a new date that increase or decreases the number of hours based on an input date. */
export const addHours = (change: number, target?: PossibleDate): Date => {
	const date = new Date(getDate(target)); // New instance, because we modify it.
	date.setHours(date.getHours() + change);
	return date;
};

/** Count the number of seconds until a date. */
export const secondsUntil = (target: PossibleDate, current?: PossibleDate): number => Math.round(getDate(target).getTime() - getDate(current).getTime()) / 1000;

/** Count the number of days ago a date was. */
export const secondsAgo = (target: PossibleDate, current?: PossibleDate): number => 0 - secondsUntil(target, current);

/** Count the number of days until a date. */
export const daysUntil = (target: PossibleDate, current?: PossibleDate): number =>
	Math.round((getMidnight(target).getTime() - getMidnight(current).getTime()) / 86400000);

/** Count the number of days ago a date was. */
export const daysAgo = (target: PossibleDate, current?: PossibleDate): number => 0 - daysUntil(target, current);

/** Count the number of weeks until a date. */
export const weeksUntil = (target: PossibleDate, current?: PossibleDate): number => Math.floor(daysUntil(target, current) / 7);

/** Count the number of weeks ago a date was. */
export const weeksAgo = (target: PossibleDate, current?: PossibleDate): number => 0 - weeksUntil(target, current);

/**
 * Get information about the difference between two dates.
 * - Used by `formatWhen()` and `formatAgo()` etc
 * @returns Tuple in `[amount, units]` format, e.g. `[3, "days"]` or `[-16, "hours"]` or `[1, "week"]`
 */
const diffDates = (target?: PossibleDate, current?: PossibleDate): [number, string] => {
	const seconds = (getDate(target).getTime() - getDate(current).getTime()) / 1000;
	const abs = Math.abs(seconds);

	// Up to 99 seconds, e.g. '22 seconds ago'
	if (abs < 99) {
		const num = Math.round(seconds);
		return [num, num === 1 ? "second" : "seconds"];
	}
	// Up to one hour  — show minutes, e.g. '18 minutes ago'
	if (abs < 3600) {
		const num = Math.round(seconds / 60);
		return [num, num === 1 ? "minute" : "minutes"];
	}
	// Up to 24 hours — show hours, e.g. '23 hours ago'
	if (abs < 86400) {
		const num = Math.round(seconds / 3600);
		return [num, num === 1 ? "hour" : "hours"];
	}
	// Up to 2 weeks — show days, e.g. '13 days ago'
	if (abs < 1209600) {
		const num = Math.round(seconds / 86400);
		return [num, num === 1 ? "day" : "days"];
	}
	// Up to 2 months — show weeks, e.g. '6 weeks ago'
	if (abs < 5184000) {
		const num = Math.round(seconds / 604800);
		return [num, num === 1 ? "week" : "weeks"];
	}
	// Up to 18 months — show months, e.g. '6 months ago'
	if (abs < 46656000) {
		const num = Math.round(seconds / 2592000);
		return [num, num === 1 ? "month" : "months"];
	}
	// Above 18 months — show years, e.g. '2 years ago'
	return [Math.round(seconds / 31536000), "year"];
};

/** Return a friendly gap between two dates, e.g. `in 10 days` or `16 hours ago` or `yesterday` */
export const formatWhen = (target: PossibleDate, current?: PossibleDate): string => {
	const [amount, unit] = diffDates(target, current);

	// Special case for rough equality.
	if (unit === "second" && amount > -30 && amount < 30) return "just now";

	// Return either `in 22 days` or `1 hour ago`
	const future = amount >= 0;
	const abs = Math.abs(amount);
	const str = formatNumber(abs);
	return future ? `in ${str} ${unit}` : `${str} ${unit} ago`;
};

/**
 * Return when a date happened, e.g. `10 days` or `2 hours` or `-1 week`
 * @param target The date when the thing will happen.
 * @param current Today's date (or a different date to measure from).
 */
export const formatUntil = (target: PossibleDate, current?: PossibleDate): string => {
	const [amount, units] = diffDates(target, current);
	return `${formatNumber(amount)} ${units}`;
};

/**
 * Return a compact version of when a date happened, e.g. `10d` or `2h` or `-1w`
 * @param target The date when the thing will happen.
 * @param current Today's date (or a different date to measure from).
 */
export const formatShortUntil = (target: PossibleDate, current?: PossibleDate): string => {
	const [amount, units] = diffDates(target, current);
	return `${formatNumber(amount)}${units.substr(0, 1)}`;
};

/**
 * Return when a date will happen, e.g. `10 days` or `2 hours` or `-1 week`
 * @param target The date when the thing happened.
 * @param current Today's date (or a different date to measure from).
 */
export const formatAgo = (target: PossibleDate, current?: PossibleDate): string => {
	const [amount, units] = diffDates(current, target);
	return `${formatNumber(amount)} ${units}`;
};

/**
 * Return a compact version of when a date will happen, e.g. `10d` or `2h` or `-1w`
 * @param target The date when the thing happened.
 * @param current Today's date (or a different date to measure from).
 */
export const formatShortAgo = (target: PossibleDate, current?: PossibleDate): string => {
	const [amount, units] = diffDates(current, target);
	return `${formatNumber(amount)}${units.substr(0, 1)}`;
};

/** Format a date in the browser locale. */
export const formatDate = (date: PossibleDate, options?: Intl.DateTimeFormatOptions): string =>
	new Intl.DateTimeFormat(undefined, options).format(getDate(date));

/** Is a date in the past? */
export const isPast = (target: PossibleDate, current?: PossibleDate): boolean => getDate(target) < getDate(current);

/** Is a date in the future? */
export const isFuture = (target: PossibleDate, current?: PossibleDate): boolean => getDate(target) > getDate(current);
