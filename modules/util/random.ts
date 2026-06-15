import type { ImmutableArray } from "./array.js";
import { requireDefined } from "./undefined.js";

/**
 * Generate a random integer between two numbers (inclusive).
 *
 * @param min Lowest possible integer to return — defaults to `Number.MIN_SAFE_INTEGER`.
 * @param max Highest possible integer to return — defaults to `Number.MAX_SAFE_INTEGER`.
 * @returns Random integer in the range `min` to `max` (inclusive).
 *
 * @example const dice = getRandom(1, 6); // e.g. `4`
 *
 * @see https://dhoulb.github.io/shelving/util/random/getRandom
 */
export function getRandom(min: number = Number.MIN_SAFE_INTEGER, max: number = Number.MAX_SAFE_INTEGER): number {
	return Math.round(Math.random() * (max - min) + min);
}

/**
 * Get a random integer that is anything except an existing number.
 * - Repeatedly draws a random integer until it differs from `existing`.
 *
 * @param existing Number that must not be returned.
 * @param min Lowest possible integer to return — defaults to `Number.MIN_SAFE_INTEGER`.
 * @param max Highest possible integer to return — defaults to `Number.MAX_SAFE_INTEGER`.
 * @returns Random integer in the range `min` to `max` that is not equal to `existing`.
 *
 * @example const next = getRandomExcept(current, 1, 6); // any of `1`–`6` except `current`
 *
 * @see https://dhoulb.github.io/shelving/util/random/getRandomExcept
 */
export function getRandomExcept(existing: number, min?: number, max?: number) {
	let num: number;
	do num = getRandom(min, max);
	while (num === existing);
	return num;
}

/**
 * Make a random key, e.g. `xs23r34hhsdx` or `e4m29klrugef`
 * - Not designed to be cryptographically random!
 * - Will probably clash — if you're making a random ID, check for existence of the record before saving.
 * - Designed to be semi-readable, doesn't use capital letters or `i` or `o` or `l` or `u`
 *
 * @param length Number of characters in the returned key — defaults to `12`.
 * @returns Random string of `length` lowercase alphanumeric characters.
 *
 * @example const id = getRandomKey(); // e.g. `xs23r34hhsdx`
 *
 * @see https://dhoulb.github.io/shelving/util/random/getRandomKey
 */
export function getRandomKey(length = 12): string {
	return Array.from({ length }, getRandomKeyCharacter).join("");
}
const KEY_CHARS = "0123456789abcdefghjkmnpqrstvwxyz";
function getRandomKeyCharacter() {
	return getRandomCharacter(KEY_CHARS);
}

/**
 * Get a random character from a string.
 *
 * @param str String to pick a character from.
 * @returns Single character chosen at random from `str`.
 *
 * @example const letter = getRandomCharacter("abcde"); // e.g. `"c"`
 *
 * @see https://dhoulb.github.io/shelving/util/random/getRandomCharacter
 */
export function getRandomCharacter(str: string): string {
	return str[getRandom(0, str.length - 1)] as string;
}

/**
 * Get a random item from an array.
 *
 * @param arr Array to pick an item from.
 * @returns Single item chosen at random from `arr`.
 * @throws RequiredError If the chosen item is undefined (e.g. the array is empty).
 *
 * @example const item = getRandomItem(["a", "b", "c"]); // e.g. `"b"`
 *
 * @see https://dhoulb.github.io/shelving/util/random/getRandomItem
 */
export function getRandomItem<T>(arr: ImmutableArray<T>): T {
	return requireDefined<T>(arr[getRandom(0, arr.length - 1)]);
}
