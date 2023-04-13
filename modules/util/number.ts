import { AssertionError } from "../error/AssertionError.js";
import { NNBSP } from "./constants.js";

/** Is a value a number? */
export const isNumber = (value: unknown): value is number => typeof value === "number";

/** Assert that a value is a number. */
export function assertNumber(value: number | unknown): asserts value is number {
	if (typeof value !== "number") throw new AssertionError(`Must be number`, value);
}

/** Assert that a value is a number greater than. */
export function assertFinite(value: number | unknown): asserts value is number {
	if (typeof value !== "number" || !Number.isFinite(value)) throw new AssertionError(`Must be finite number`, value);
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
export function assertBetween(value: number | unknown, min: number, max: number): asserts value is number {
	if (typeof value !== "number" || isBetween(value, min, max)) throw new AssertionError(`Must be number between ${min} and ${max}`, value);
}

/** Assert that a value is a number greater than. */
export function assertMax(value: number | unknown, max: number): asserts value is number {
	if (typeof value !== "number" || value > max) throw new AssertionError(`Must be number with maximum ${max}`, value);
}

/** Assert that a value is a number less than. */
export function assertMin(value: number | unknown, min: number): asserts value is number {
	if (typeof value !== "number" || value < min) throw new AssertionError(`Must be number with minimum ${min}`, value);
}

/**
 * Convert an unknown value to a finite number or `null`
 * - Note: numbers can be non-finite numbers like `NaN` or `Infinity`. These are detected and will always return `null`
 *
 * Conversion rules:
 * - Numbers (except `NaN` and `+Infinity` and `-Infinity`) return numbers.
 * - Strings are parsed as numbers.
 * - Dates return their milliseconds (e.g. `date.getTime()`)
 * - Everything else returns `null`
 */
export function getOptionalNumber(value: unknown): number | null {
	if (typeof value === "number") return !Number.isFinite(value) ? null : value === 0 ? 0 : value;
	else if (typeof value === "string") return getOptionalNumber(parseFloat(value.replace(NOT_NUMERIC_REGEXP, "")));
	else if (value instanceof Date) return getOptionalNumber(value.getTime());
	return null;
}
const NOT_NUMERIC_REGEXP = /[^0-9-.]/g;

/**
 * Assertively convert an unknown value to a finite number.
 * @throws `AssertionError` if the value cannot be converted.
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
export const roundStep = (num: number, step = 1): number => Math.round(num / step) * step;

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
export const roundNumber = (num: number, precision = 0): number => Math.round(num * 10 ** precision) / 10 ** precision;

/**
 * Truncate a number to a specified set of decimal places.
 * - Better than `Math.trunc()` because it allows a `precision` argument.
 *
 * @param num The number to truncate.
 * @param precision Maximum number of digits shown after the decimal point (defaults to 0).
 * @returns The number truncated to the specified precision.
 */
export const truncateNumber = (num: number, precision = 0): number => Math.trunc(num * 10 ** precision) / 10 ** precision;

/** Bound a number so it fits between two values. */
export function boundNumber(num: number, min: number, max: number): number {
	assertMin(max, min); // Assert that max is more than min.
	return Math.max(min, Math.min(max, num));
}

/** Wrap a number so it fits between two values. */
export function wrapNumber(num: number, min: number, max: number): number {
	assertMin(max, min); // Assert that max is more than min.
	if (num >= max) return ((num - max) % (max - min)) + min;
	if (num < min) return ((num - min) % (min - max)) + max;
	return num;
}

/** Options for `formatNumber()` and `formatRange()`. */
export interface NumberOptions extends Intl.NumberFormatOptions {
	roundingMode?: "ceil" | "floor" | "expand" | "trunc" | "halfCeil" | "halfFloor" | "halfExpand" | "halfTrunc" | "halfEven" | undefined;
	roundingPriority?: "morePrecision" | "lessPrecision" | undefined;
}

/** Format a number (based on the user's browser language settings). */
export function formatNumber(num: number, options: NumberOptions = { maximumFractionDigits: 2 }): string {
	if (Number.isNaN(num)) return "None";
	if (!Number.isFinite(num)) return "∞";
	return new Intl.NumberFormat(undefined, options as Intl.NumberFormatOptions | undefined).format(num);
}

/** Format a number range (based on the user's browser language settings). */
export function formatRange(min: number, max: number, options?: NumberOptions): string {
	return `${formatNumber(min, options)}–${formatNumber(max, options)}`;
}

/** Format a number with a short suffix, e.g. `1,000 kg` */
export const formatQuantity = (num: number, abbr: string, options?: NumberOptions): string => `${formatNumber(num, options)}${NNBSP}${abbr}`;

/** Format a number with a longer full-word suffix. */
export function pluralizeQuantity(num: number, singular: string, plural: string, options?: NumberOptions): string {
	const qty = formatNumber(num, options);
	return `${qty} ${qty === "1" ? singular : plural}`;
}

/**
 * Get a number as a percentage of another number.
 *
 * @param numerator Number representing the amount of progress.
 * @param denumerator The number representing the whole amount.
 */
export const getPercent = (numerator: number, denumerator: number) => Math.max(0, Math.min(100, (100 / denumerator) * numerator));

/**
 * Format a percentage (combines `getPercent()` and `formatQuantity()` for convenience).
 * - Defaults to showing no decimal places.
 * - Defaults to rounding closer to zero (so that 99.99% is shown as 99%).
 *
 * @param numerator Number representing the amount of progress.
 * @param denumerator The number representing the whole amount.
 */
export const formatPercent = (numerator: number, denumerator: number, options?: NumberOptions): string => formatQuantity(getPercent(numerator, denumerator), "%", { maximumFractionDigits: 0, roundingMode: "trunc", ...options });

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
