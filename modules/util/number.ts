import { AssertionError } from "../error/AssertionError.js";

// Constants.
export const TRILLION = 1_000_000_000_000;
export const BILLION = 1_000_000_000;
export const MILLION = 1_000_000;

/** Is a value a number? */
export const isNumber = (v: unknown): v is number => typeof v === "number";

/** Assert that a value is a number. */
export function assertNumber(v: number | unknown): asserts v is number {
	if (typeof v !== "number") throw new AssertionError(`Must be number`, v);
}

/** Assert that a value is a number greater than. */
export function assertBetween(v: number | unknown, min: number, max: number): asserts v is number {
	if (typeof v !== "number" || v < min || v > max) throw new AssertionError(`Must be number between ${min}-${max}`, v);
}

/** Assert that a value is a number greater than. */
export function assertMax(v: number | unknown, max: number): asserts v is number {
	if (typeof v !== "number" || v > max) throw new AssertionError(`Must be number with maximum ${max}`, v);
}

/** Assert that a value is a number less than. */
export function assertMin(v: number | unknown, min: number): asserts v is number {
	if (typeof v !== "number" || v < min) throw new AssertionError(`Must be number with minimum ${min}`, v);
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
	else if (typeof value === "string") return getOptionalNumber(parseFloat(value.replace(NUMERIC, "")));
	else if (value instanceof Date) return value.getTime();
	return null;
}
const NUMERIC = /[^0-9-.]/g;

/**
 * Assertively convert an unknown value to a finite number.
 * @throws `AssertionError` if the value cannot be converted.
 */
export function getNumber(value: unknown): number {
	const num = getOptionalNumber(value);
	assertNumber(num);
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
 * @param precision Maximum number of digits shown after the decimal point (defaults to 10).
 *
 * @returns The number truncated to the specified precision.
 */
export const truncateNumber = (num: number, precision = 0): number => Math.trunc(num * 10 ** precision) / 10 ** precision;

/**
 * Format a number (based on the user's browser settings).
 *
 * @param num The number to format.
 * @param maxPrecision Maximum number of digits shown after the decimal point (defaults to 2).
 * @param minPrecision Minimum number of digits shown after the decimal point (defaults to 0).
 *
 * @returns The number formatted as a string in the browser's current locale.
 */
export function formatNumber(num: number, maxPrecision = 4, minPrecision = 0): string {
	if (!Number.isFinite(num)) return Number.isNaN(num) ? "None" : "Infinity";
	return new Intl.NumberFormat(undefined, { maximumFractionDigits: maxPrecision, minimumFractionDigits: minPrecision }).format(num);
}

/** Format a number with a short suffix. */
export const formatQuantity = (num: number, suffix: string, maxPrecision?: number, minPrecision?: number): string => `${formatNumber(num, maxPrecision, minPrecision)}${suffix}`;

/** Format a number with a longer full-word suffix. */
export function formatFullQuantity(num: number, singular: string, plural: string, maxPrecision?: number, minPrecision?: number): string {
	const qty = formatNumber(num, maxPrecision, minPrecision);
	return `${qty} ${qty === "1" ? singular : plural}`;
}

/**
 * Cram a large whole numbers into a space efficient format, e.g. `14.7M`
 * - Improves glanceability.
 * - Keeps number of characters under five if possible.
 *
 * - Numbers over 100 trillion: `157T`
 * - Numbers over 10 trillion: `15.7T` (includes zero e.g. `40.0T` for consistency).
 * - Numbers over 1 trillion: `1.57T` (includes zeros e.g. `4.00T` for consistency).
 * - Numbers over 100 billion: `157B`
 * - Numbers over 10 billion: `15.7B` (includes zero e.g. `40.0B` for consistency).
 * - Numbers over 1 billion: `1.57B` (includes zeros e.g. `4.00B` for consistency).
 * - Numbers over 100 million: `157M`
 * - Numbers over 10 million: `15.7M` (includes zero e.g. `40.0M` for consistency).
 * - Numbers over 1 million: `1.57M` (includes zeros e.g. `4.00M` for consistency).
 * - Numbers over 100,000: `157K`
 * - Numbers over 10,000: `15.7K` (includes zero e.g. `14.0K` for consistency).
 * - Smaller numbers: `1570` and `157` and `15.7` and `1.6`
 *
 * @param num The number to format.
 * @param precision Maximum number of digits shown after the decimal point (defaults to 10, only used for numbers under 10,000).
 *
 * @returns The number formatted as a crammed string.
 */
export function cramNumber(num: number): string {
	const abs = Math.abs(num);
	if (abs >= TRILLION) return `${_significance(num / TRILLION)}T`;
	if (abs >= BILLION) return `${_significance(num / BILLION)}B`;
	if (abs >= MILLION) return `${_significance(num / MILLION)}M`;
	if (abs >= 10_000) return `${_significance(num / 1_000)}K`;
	return truncateNumber(num, 2).toString();
}
function _significance(num: number): string {
	const digits = num >= 100 ? 0 : num >= 10 ? 1 : 2;
	return truncateNumber(num, digits).toFixed(digits);
}

/** Cram a number with a short suffix. */
export const cramQuantity = (num: number, suffix: string): string => `${cramNumber(num)}${suffix}`;

/** Cram a number with a longer full-word suffix. */
export function cramFullQuantity(num: number, singular: string, plural: string): string {
	const qty = cramNumber(num);
	return `${qty} ${qty === "1" ? singular : plural}`;
}

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

/**
 * Get a number as a percentage of another number.
 *
 * @param numerator Number representing the amount of progress.
 * @param denumerator The number representing the whole amount.
 */
export const getPercent = (numerator: number, denumerator: number) => Math.max(0, Math.min(100, (100 / denumerator) * numerator));

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
