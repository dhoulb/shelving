import type { ImmutableArray } from "../array";

/**
 * Make a random ID for a document, e.g. "xs23rsdxe4mrugef"
 * - Not designed to be cryptographically random!
 * - Will probably clash — if you're making a random ID, check for existence of the record before saving.
 */
export const randomId = (length = 16): string => Array(length).fill("0").map(randomCharacter).join("").toLowerCase();

/** Generate a random character from the set `[0-9A-Z]` but without any of the following: `I`, `L`, `O`, `U` */
export const randomCharacter = (): string => randomItem(CHARS);
const CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"]; // prettier-ignore

/**
 * Get a random item from an array.
 * - Assumes the array is fully filled and doesn't have any missing items between zero and `arr.length`
 */
export const randomItem = <T>(arr: ImmutableArray<T>): T => arr[randomInteger(0, arr.length - 1)] as T;

/** Generate a random integer between two numbers. */
export const randomInteger = (min: number, max: number): number => Math.round(Math.random() * (max - min) + min);
