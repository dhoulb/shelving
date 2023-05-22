import type { ImmutableArray } from "./array.js";
import { getDefined } from "./undefined.js";

/** Generate a random integer between two numbers. */
export const getRandom = (min: number = Number.MIN_SAFE_INTEGER, max: number = Number.MAX_SAFE_INTEGER): number => Math.round(Math.random() * (max - min) + min);

/** Get a random number that is anything except an existing number. */
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
 */
export const getRandomKey = (length = 12): string => Array.from({ length }, getRandomKeyCharacter).join("");
const KEY_CHARS = "0123456789abcdefghjkmnpqrstvwxyz";
const getRandomKeyCharacter = () => getRandomCharacter(KEY_CHARS);

/** Get a random character from a string. */
export const getRandomCharacter = (str: string): string => str[getRandom(0, str.length - 1)] as string;

/** Get a random item from an array or random character from a string string. */
export const getRandomItem = <T>(arr: ImmutableArray<T>): T => getDefined<T>(arr[getRandom(0, arr.length - 1)]);
