import { AssertionError } from "../error/AssertionError.js";
import { ValueError } from "../error/ValueError.js";
import { NNBSP } from "./constants.js";

/** Is a value a number? */
export function isNumber(value: unknown): value is number {
	return typeof value === "number";
}

/** Assert that a value is a number. */
export function assertNumber(value: unknown): asserts value is number {
	if (typeof value !== "number") throw new AssertionError("Must be number", { received: value, caller: assertNumber });
}

/** Assert that a value is a finite number (i.e. not `NaN` or positive/negative `Infinity`). */
export function assertFinite(value: unknown): asserts value is number {
	if (typeof value !== "number" || !Number.isFinite(value))
		throw new AssertionError("Must be finite number", { received: value, caller: assertFinite });
}

/**
 * Is a finite number within a specified range?
 *
 * @param num The number to test, e.g. `17`
 * @param min The start of the range, e.g. `10`
 * @param max The end of the range, e.g. `20`
 */
export const isBetween = (num: number, min: number, max: number): boolean => num >= min && num <= max;

/** Assert that a value is a number greater than. */
export function assertBetween(value: unknown, min: number, max: number): asserts value is number {
	if (typeof value !== "number" || isBetween(value, min, max))
		throw new AssertionError(`Must be number between ${min} and ${max}`, { received: value, caller: assertBetween });
}

/** Assert that a value is a number greater than. */
export function assertMax(value: unknown, max: number): asserts value is number {
	if (typeof value !== "number" || value > max)
		throw new AssertionError(`Must be number with maximum ${max}`, { received: value, caller: assertMax });
}

/** Assert that a value is a number less than. */
export function assertMin(value: unknown, min: number): asserts value is number {
	if (typeof value !== "number" || value < min)
		throw new AssertionError(`Must be number with minimum ${min}`, { received: value, caller: assertMin });
}

/**
 * Convert an unknown value to a finite number or `undefined`
 * - Note: numbers can be non-finite numbers like `NaN` or `Infinity`. These are detected and will always return `undefined`
 *
 * Conversion rules:
 * - Finite numbers return numbers.
 * - `-0` is normalised to `0`
 * - Strings are parsed as numbers.
 * - Dates return their milliseconds (e.g. `date.getTime()`).
 * - Everything else returns `undefined`
 */
export function getOptionalNumber(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isFinite(value)) return value === 0 ? 0 : value;
	if (typeof value === "string") return getOptionalNumber(Number.parseFloat(value.replace(NOT_NUMERIC_REGEXP, "")));
	if (value instanceof Date) return getOptionalNumber(value.getTime());
}
const NOT_NUMERIC_REGEXP = /[^0-9-.]/g;

/**
 * Assertively convert an unknown value to a finite number.
 * @throws `ValueError` if the value cannot be converted.
 */
export function getNumber(value: unknown): number {
	const num = getOptionalNumber(value);
	assertFinite(num);
	return num;
}

/**
 * Round numbers to a given step.
 *
 * @param num The number to round.
 * @param step The rounding to round to, e.g. `2` or `0.1` (defaults to `1`, i.e. round numbers).
 *
 * @returns The number rounded to the specified step.
 */
export function roundStep(num: number, step = 1): number {
	return Math.round(num / step) * step;
}

/**
 * Round a number to a specified set of decimal places.
 * - Better than `Math.round()` because it allows a `precision` argument.
 * - Better than `num.toFixed()` because it trims excess `0` zeroes.
 *
 * @param num The number to round.
 * @param precision Maximum number of digits shown after the decimal point (defaults to 10).
 *
 * @returns The number rounded to the specified precision.
 */
export function roundNumber(num: number, precision = 0): number {
	return Math.round(num * 10 ** precision) / 10 ** precision;
}

/**
 * Truncate a number to a specified set of decimal places.
 * - Better than `Math.trunc()` because it allows a `precision` argument.
 *
 * @param num The number to truncate.
 * @param precision Maximum number of digits shown after the decimal point (defaults to 0).
 * @returns The number truncated to the specified precision.
 */
export function truncateNumber(num: number, precision = 0): number {
	return Math.trunc(num * 10 ** precision) / 10 ** precision;
}

/**
 * Bound a number between two values.
 * - e.g. `12` bounded by `2` and `8` is `8`
 */
export function boundNumber(num: number, min: number, max: number): number {
	if (max < min) throw new ValueError("Max must be more than min", { min, max, caller: wrapNumber });
	return Math.max(min, Math.min(max, num));
}

/**
 * Wrap a number between two values.
 * - Numbers wrap around between min and max (like a clock).
 * - e.g. `12` bounded by `2` and `8` is `6`
 * - Words in both directions.
 * - e.g. `-2` bounded by `2` and `8` is `4`
 */
export function wrapNumber(num: number, min: number, max: number): number {
	if (max < min) throw new ValueError("Max must be more than min", { min, max, caller: wrapNumber });
	if (num >= max) return ((num - max) % (max - min)) + min;
	if (num < min) return ((num - min) % (min - max)) + max;
	return num;
}

/** Format a number (based on the user's browser language settings). */
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
	if (!Number.isFinite(num)) return Number.isNaN(num) ? "-" : "∞";
	return new Intl.NumberFormat(undefined, options).format(num).replace(/ /, NNBSP);
}

/** Format a number range (based on the user's browser language settings). */
export function formatRange(min: number, max: number, options?: Intl.NumberFormatOptions): string {
	return `${formatNumber(min, options)}–${formatNumber(max, options)}`;
}

/** Format a number with a short suffix, e.g. `1,000 kg` */
export function formatQuantity(num: number, abbr: string, options?: Intl.NumberFormatOptions): string {
	const o: Intl.NumberFormatOptions = { unitDisplay: "short", ...options, style: "decimal" };
	const str = formatNumber(num, o);
	const sep = o.unitDisplay === "narrow" ? "" : NNBSP;
	return `${str}${sep}${abbr}`;
}

/** Format a number with a longer full-word suffix. */
export function pluralizeQuantity(num: number, singular: string, plural: string, options?: Intl.NumberFormatOptions): string {
	const o: Intl.NumberFormatOptions = { ...options, style: "decimal" };
	const qty = formatNumber(num, o);
	return `${qty}${NNBSP}${num === 1 ? singular : plural}`;
}

/**
 * Get a number as a percentage of another number.
 *
 * @param numerator Number representing the amount of progress.
 * @param denumerator The number representing the whole amount.
 */
export function getPercent(numerator: number, denumerator: number) {
	return Math.max(0, Math.min(100, (100 / denumerator) * numerator));
}

/**
 * Format a percentage (combines `getPercent()` and `formatQuantity()` for convenience).
 * - Defaults to showing no decimal places.
 * - Defaults to rounding closer to zero (so that 99.99% is shown as 99%).
 *
 * @param numerator Number representing the amount of progress.
 * @param denumerator The number representing the whole amount.
 */
export function formatPercent(numerator: number, denumerator: number, options?: Intl.NumberFormatOptions): string {
	const fullOptions: Intl.NumberFormatOptions = { style: "percent", maximumFractionDigits: 0, roundingMode: "trunc", ...options };
	return formatNumber(getPercent(numerator, denumerator), fullOptions);
}

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
