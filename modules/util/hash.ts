import { wrapNumber } from "./number.js";

/**
 * Hash a string into an idempotent number.
 * - Sums the char codes of every character, so the same string always produces the same number.
 * - Not cryptographically secure — intended for cheap, stable bucketing.
 *
 * @param str The string to hash.
 * @returns A non-negative number derived from the string's characters.
 * @example hashString("abc") // 294
 * @see https://dhoulb.github.io/shelving/util/hash/hashString
 */
export function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
	return hash;
}

/**
 * Hash a string into an idempotent number wrapped between two values.
 * - Useful for deterministically mapping a string into a fixed range, e.g. a colour or bucket index.
 *
 * @param str The string to hash.
 * @param min The inclusive lower bound of the output range. Defaults to `0`.
 * @param max The exclusive upper bound of the output range. Defaults to `256`.
 * @returns A number in the range `min` to `max` derived from the string.
 * @example hashStringBetween("abc", 0, 10) // 4
 * @see https://dhoulb.github.io/shelving/util/hash/hashStringBetween
 */
export function hashStringBetween(str: string, min = 0, max = 256): number {
	return wrapNumber(hashString(str), min, max);
}
