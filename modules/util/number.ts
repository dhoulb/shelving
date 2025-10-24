import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import type { AnyCaller } from "./function.js";

/** Values that can be converted to a number. */
export type PossibleNumber = number | string | Date;

/** Is a value a finite number? */
export function isNumber(value: unknown, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY): value is number {
	return Number.isFinite(value) && (value as number) >= min && (value as number) <= max;
}

/** Assert that a value is a finite number. */
export function assertNumber(value: unknown, min?: number, max?: number, caller: AnyCaller = assertNumber): asserts value is number {
	if (!isNumber(value, min, max))
		throw new RequiredError(
			`Must be finite number${max !== undefined ? ` between ${min ?? 0} and ${max}` : min !== undefined ? ` above ${min}` : ""}`,
			{ received: value, caller },
		);
}

/**
 * Convert an unknown value to a finite number, or return `undefined` if it cannot be converted.
 * - Note: numbers can be non-finite numbers like `NaN` or `Infinity`. These are detected and will always return `undefined`
 *
 * Conversion rules:
 * - Finite numbers return numbers.
 * - `-0` is normalised to `0`
 * - Strings are parsed as numbers using `Number.parseFloat()` after removing all non-numeric characters.
 * - Dates return their milliseconds (e.g. `date.getTime()`).
 * - Everything else returns `undefined`
 */
export function getNumber(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isFinite(value)) return value === 0 ? 0 : value;
	if (typeof value === "string") return getNumber(Number.parseFloat(value.replace(NOT_NUMERIC_REGEXP, "")));
	if (value instanceof Date) getNumber(value.getTime());
}
const NOT_NUMERIC_REGEXP = /[^0-9-.]/g;

/**
 * Convert a possible number to a finite number, or throw `ValueError` if the value cannot be converted.
 */
export function requireNumber(value: PossibleNumber, min?: number, max?: number, caller?: AnyCaller): number {
	const num = getNumber(value);
	assertNumber(num, min, max, caller);
	return num;
}

/** Is an unknown value an integer (optionally with specified min/max values). */
export function isInteger(value: unknown, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER): value is number {
	return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

/** Assert that a value is an integer. */
export function assertInteger(value: unknown, min?: number, max?: number, caller: AnyCaller = assertInteger): asserts value is number {
	if (!isInteger(value, min, max))
		throw new RequiredError(
			`Must be integer${max !== undefined ? ` between ${min ?? 0} and ${max}` : min !== undefined ? ` above ${min}` : ""}`,
			{ received: value, caller },
		);
}

/**
 * Convert an unknown value to an integer, or return `undefined` if it cannot be converted.
 *
 * Conversion rules:
 * - Integers return integers.
 * - `-0` is normalised to `0`
 * - Strings are parsed as integers using `parseInt()` after removing non-numeric characters.
 * - Dates return their milliseconds (e.g. `date.getTime()`).
 * - Everything else returns `undefined`
 */
export function getInteger(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isInteger(value)) return value === 0 ? 0 : value;
	if (typeof value === "string") return getInteger(Number.parseInt(value.replace(NOT_NUMERIC_REGEXP, ""), 10));
	if (value instanceof Date) return getInteger(value.getTime());
}

/** Convert a possible number to an integer, or throw `ValueError` if the value cannot be converted. */
export function requireInteger(value: PossibleNumber, min?: number, max?: number, caller: AnyCaller = requireInteger): number {
	const num = getNumber(value);
	assertInteger(num, min, max, caller);
	return num;
}

/**
 * Is a number within a specified range?
 *
 * @param num The number to test, e.g. `17`
 * @param min The start of the range, e.g. `10`
 * @param max The end of the range, e.g. `20`
 */
export function isBetween(num: number, min: number, max: number): boolean {
	return num >= min && num <= max;
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

/**
 * Get a number as a percentage of another number.
 *
 * @param numerator Number representing the amount of progress.
 * @param denumerator The number representing the whole amount (defaults to 100).
 */
export function getPercent(numerator: number, denumerator = 100) {
	return denumerator === 100 ? numerator : (100 / denumerator) * numerator;
}

/** Sum an iterable set of numbers and return the total. */
export function sumNumbers(nums: Iterable<number>): number {
	let sum = 0;
	for (const num of nums) sum += num;
	return sum;
}

/** Find the number that's closest to a target in an iterable set of numbers. */
export function getClosestNumber<T extends number>(nums: Iterable<T>, target: number): T | undefined {
	let closest: T | undefined;
	for (const item of nums) if (closest === undefined || Math.abs(item - target) < Math.abs(closest - target)) closest = item;
	return closest;
}
