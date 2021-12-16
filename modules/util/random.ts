import type { ImmutableArray } from "./array.js";
import { yieldUntilLimit, yieldCall } from "./iterate.js";
import { concatStrings } from "./string.js";
import { getDefined } from "./undefined.js";

/** Generate a random integer between two numbers. */
export const getRandom = (min: number, max: number): number => Math.round(Math.random() * (max - min) + min);

/**
 * Make a random key, e.g. "xs23rsdxe4mrugef"
 * - Not designed to be cryptographically random!
 * - Will probably clash — if you're making a random ID, check for existence of the record before saving.
 */
export const getRandomKey = (length = 16): string => concatStrings(yieldUntilLimit(yieldCall(getRandomCharacter, KEY_CHARS), length));
const KEY_CHARS = "0123456789abcdefghjkmnpqrstvwxyz";

/** Get a random character from a string. */
export const getRandomCharacter = (str: string): string => str[getRandom(0, str.length - 1)] as string;

/** Get a random item from an array or random character from a string string. */
export const getRandomItem = <T>(arr: ImmutableArray<T>): T => getDefined<T>(arr[getRandom(0, arr.length - 1)]);
