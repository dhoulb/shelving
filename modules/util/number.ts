import { AssertionError } from "../errors/index.js";

/** Is a value a number? */
export const isNumber = (v: unknown): v is number => typeof v === "number";

/**
 * Convert an unknown value to a number or `null`
 * - Note: numbers can be non-finite numbers like `NaN` or `Infinity`. These are detected and will always return `null`
 *
 * Conversion rules:
 * - Numbers (except `NaN`) return numbers.
 * - Strings are parsed as numbers.
 * - Dates return their milliseconds (e.g. `date.getTime()`)
 * - Everything else returns `null`
 */
export function toNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") return stringToNumber(value);
	if (value instanceof Date) return value.getTime();
	return null;
}

const R_NON_NUMERIC = /[^0-9]+/g; // Any non-numeric characters.
const R_PREFIX = /^[^0-9.]*/; // Characters that come before any digits or decimal points

/**
 * Convert a stringy number into a number.
 *
 * @param str The string to convert.
 * @return The number, null (valid, meaning no number).
 */
export const stringToNumber = (str: string): number | null => {
	if (!str) return null;
	const [a, ...b] = str.split(".") as [string, ...string[]];
	const num = Number.parseFloat(`${a.replace(R_NON_NUMERIC, "")}.${b.join("").replace(R_NON_NUMERIC, "")}`);
	if (Number.isNaN(num)) return null;
	const isNeg = !((str.match(R_PREFIX)?.[0] || "").split("-").length % 2);
	return Number.isNaN(num) ? null : isNeg ? 0 - num : num;
};

/**
 * Round numbers to a given step.
 *
 * @param num The number to round.
 * @param step The rounding to round to, e.g. `2` or `0.1` (defaults to `1`, i.e. round numbers).
 * @returns The number rounded to the step.
 */
export const roundNumber = (num: number, step = 1): number => {
	if (step < 0.00001) throw new AssertionError("roundNumber() does not work accurately with steps smaller than 0.00001", step);
	return Math.round(num / step) * step;
};

/**
 * Format a number (based on the user's browser settings).
 * @param num The number to format.
 * @param precision Maximum of digits shown after the decimal point (defaults to 10), with zeroes trimmed.
 * @returns The number formatted as a string in the browser's current locale.
 */
export const formatNumber = (num: number, precision = 10): string => new Intl.NumberFormat(undefined, { maximumFractionDigits: precision }).format(num);

/**
 * Is a number within a specified range?
 *
 * @param num The number to test, e.g. `17`
 * @param start The start of the range, e.g. `10`
 * @param end The end of the range, e.g. `20`
 */
export const isBetween = (num: number, start: number, end: number): boolean => num >= start && num <= end;
