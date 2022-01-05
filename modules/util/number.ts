import { AssertionError } from "../error/index.js";

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
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	else if (typeof value === "string") return toNumber(parseFloat(value.replace(NUMERIC, "")));
	else if (value instanceof Date) return value.getTime();
	return null;
}
const NUMERIC = /[^0-9-.]/g;

/**
 * Assertively convert an unknown value to a finite number.
 * @throws `AssertionError` if the value cannot be converted.
 */
export function getNumber(value: unknown): number {
	const num = toNumber(value);
	if (num === null) throw new AssertionError("Must be number", value);
	return num;
}

/**
 * Round numbers to a given step.
 *
 * @param num The number to round.
 * @param step The rounding to round to, e.g. `2` or `0.1` (defaults to `1`, i.e. round numbers).
 * @returns The number rounded to the step.
 */
export function roundStep(num: number, step = 1): number {
	if (step < 0.00001) throw new AssertionError("roundToStep() does not work accurately with steps smaller than 0.00001", step);
	return Math.round(num / step) * step;
}

/**
 * Round a number to a specified set of decimal places.
 * - Doesn't include excess `0` zeroes like `num.toFixed()` and `num.toPrecision()` do.
 *
 * @param num The number to format.
 * @param precision Maximum of digits shown after the decimal point (defaults to 10), with zeroes trimmed.
 * @returns The number formatted as a string in the browser's current locale.
 */
export const roundNumber = (num: number, precision = 10): string => new Intl.NumberFormat("en-US", { maximumFractionDigits: precision }).format(num);

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

/**
 * Apply a min/max to a number to return a number that's definitely in the specified range.
 *
 * @param num The number to apply the min/max to, e.g. `17`
 * @param start The start of the range, e.g. `10`
 * @param end The end of the range, e.g. `20`
 */
export const getBetween = (num: number, start: number, end: number) => Math.max(start, Math.min(end, num));

/** Sum an iterable set of numbers and return the total. */
export function sumNumbers(nums: Iterable<number>): number {
	let sum = 0;
	for (const num of nums) sum += num;
	return sum;
}

/** Find the number that's closest to a target in an iterable set of numbers. */
export function getClosestNumber<T extends number>(nums: Iterable<T>, target: number): T | undefined {
	let closest: T | undefined = undefined;
	for (const item of nums) if (closest === undefined || Math.abs(item - target) < Math.abs(closest - target)) closest = item;
	return closest;
}
