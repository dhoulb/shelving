import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import type { AnyCaller } from "./function.js";

/**
 * Values that can be converted to a number.
 *
 * @see https://shelving.cc/util/number/PossibleNumber
 */
export type PossibleNumber = number | string | Date;

/**
 * Is a value a finite number (optionally within a specified min/max range)?
 *
 * @param value The value to test.
 * @param min Minimum allowed value, inclusive (defaults to `-Infinity`).
 * @param max Maximum allowed value, inclusive (defaults to `+Infinity`).
 * @returns `true` if `value` is a finite number within range, otherwise `false`.
 * @example isNumber(17, 10, 20) // true
 * @see https://shelving.cc/util/number/isNumber
 */
export function isNumber(value: unknown, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY): value is number {
	return Number.isFinite(value) && (value as number) >= min && (value as number) <= max;
}

/**
 * Assert that a value is a finite number (optionally within a specified min/max range).
 *
 * @param value The value to assert.
 * @param min Minimum allowed value, inclusive.
 * @param max Maximum allowed value, inclusive.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns Nothing; narrows `value` to `number`.
 * @throws `RequiredError` if `value` is not a finite number within range.
 * @example assertNumber(5, 0, 10); // passes
 * @see https://shelving.cc/util/number/assertNumber
 */
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
 *
 * @param value The value to convert.
 * @returns The finite number, or `undefined` if `value` cannot be converted.
 * @example getNumber("1.5kg") // 1.5
 * @see https://shelving.cc/util/number/getNumber
 */
export function getNumber(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isFinite(value)) return value === 0 ? 0 : value;
	if (typeof value === "string") return getNumber(Number.parseFloat(value.replace(NOT_NUMERIC_REGEXP, "")));
	if (value instanceof Date) return getNumber(value.getTime());
}
const NOT_NUMERIC_REGEXP = /[^0-9-.]/g;

/**
 * Convert a possible number to a finite number, or throw `ValueError` if the value cannot be converted.
 *
 * @param value The value to convert.
 * @param min Minimum allowed value, inclusive.
 * @param max Maximum allowed value, inclusive.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns The finite number.
 * @throws `RequiredError` if `value` cannot be converted to a finite number within range.
 * @example requireNumber("42") // 42
 * @see https://shelving.cc/util/number/requireNumber
 */
export function requireNumber(value: PossibleNumber, min?: number, max?: number, caller?: AnyCaller): number {
	const num = getNumber(value);
	assertNumber(num, min, max, caller);
	return num;
}

/**
 * Is an unknown value an integer (optionally within specified min/max values)?
 *
 * @param value The value to test.
 * @param min Minimum allowed value, inclusive (defaults to `Number.MIN_SAFE_INTEGER`).
 * @param max Maximum allowed value, inclusive (defaults to `Number.MAX_SAFE_INTEGER`).
 * @returns `true` if `value` is an integer within range, otherwise `false`.
 * @example isInteger(5, 0, 10) // true
 * @see https://shelving.cc/util/number/isInteger
 */
export function isInteger(value: unknown, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER): value is number {
	return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

/**
 * Assert that a value is an integer (optionally within specified min/max values).
 *
 * @param value The value to assert.
 * @param min Minimum allowed value, inclusive.
 * @param max Maximum allowed value, inclusive.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns Nothing; narrows `value` to `number`.
 * @throws `RequiredError` if `value` is not an integer within range.
 * @example assertInteger(5, 0, 10); // passes
 * @see https://shelving.cc/util/number/assertInteger
 */
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
 *
 * @param value The value to convert.
 * @returns The integer, or `undefined` if `value` cannot be converted.
 * @example getInteger("42px") // 42
 * @see https://shelving.cc/util/number/getInteger
 */
export function getInteger(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isInteger(value)) return value === 0 ? 0 : value;
	if (typeof value === "string") return getInteger(Number.parseInt(value.replace(NOT_NUMERIC_REGEXP, ""), 10));
	if (value instanceof Date) return getInteger(value.getTime());
}

/**
 * Convert a possible number to an integer, or throw `ValueError` if the value cannot be converted.
 *
 * @param value The value to convert.
 * @param min Minimum allowed value, inclusive.
 * @param max Maximum allowed value, inclusive.
 * @param caller Function used to attribute a thrown error to the calling site.
 * @returns The integer.
 * @throws `RequiredError` if `value` cannot be converted to an integer within range.
 * @example requireInteger("42") // 42
 * @see https://shelving.cc/util/number/requireInteger
 */
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
 * @returns `true` if `num` is between `min` and `max` (inclusive), otherwise `false`.
 * @example isBetween(17, 10, 20) // true
 * @see https://shelving.cc/util/number/isBetween
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
 * @example roundStep(17, 5) // 15
 * @see https://shelving.cc/util/number/roundStep
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
 * @example roundNumber(1.2345, 2) // 1.23
 * @see https://shelving.cc/util/number/roundNumber
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
 * @example truncateNumber(1.2999, 2) // 1.29
 * @see https://shelving.cc/util/number/truncateNumber
 */
export function truncateNumber(num: number, precision = 0): number {
	return Math.trunc(num * 10 ** precision) / 10 ** precision;
}

/**
 * Bound a number between two values.
 * - e.g. `12` bounded by `2` and `8` is `8`
 *
 * @param num The number to bound.
 * @param min The minimum bound, inclusive.
 * @param max The maximum bound, inclusive.
 * @returns `num` clamped to lie between `min` and `max`.
 * @throws `ValueError` if `max` is less than `min`.
 * @example boundNumber(12, 2, 8) // 8
 * @see https://shelving.cc/util/number/boundNumber
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
 *
 * @param num The number to wrap.
 * @param min The minimum bound, inclusive.
 * @param max The maximum bound, exclusive (values wrap back to `min`).
 * @returns `num` wrapped to lie between `min` and `max`.
 * @throws `ValueError` if `max` is less than `min`.
 * @example wrapNumber(12, 2, 8) // 6
 * @see https://shelving.cc/util/number/wrapNumber
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
 * @returns `numerator` expressed as a percentage of `denumerator`.
 * @example getPercent(1, 4) // 25
 * @see https://shelving.cc/util/number/getPercent
 */
export function getPercent(numerator: number, denumerator = 100) {
	return denumerator === 100 ? numerator : (100 / denumerator) * numerator;
}

/**
 * Sum an iterable set of numbers and return the total.
 *
 * @param nums The iterable of numbers to sum.
 * @returns The total of all the numbers (`0` if `nums` is empty).
 * @example sumNumbers([1, 2, 3]) // 6
 * @see https://shelving.cc/util/number/sumNumbers
 */
export function sumNumbers(nums: Iterable<number>): number {
	let sum = 0;
	for (const num of nums) sum += num;
	return sum;
}

/**
 * Find the number that's closest to a target in an iterable set of numbers.
 *
 * @param nums The iterable of numbers to search.
 * @param target The target number to find the closest match for.
 * @returns The number closest to `target`, or `undefined` if `nums` is empty.
 * @example getClosestNumber([1, 5, 10], 6) // 5
 * @see https://shelving.cc/util/number/getClosestNumber
 */
export function getClosestNumber<T extends number>(nums: Iterable<T>, target: number): T | undefined {
	let closest: T | undefined;
	for (const item of nums) if (closest === undefined || Math.abs(item - target) < Math.abs(closest - target)) closest = item;
	return closest;
}
