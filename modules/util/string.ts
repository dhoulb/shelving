/* eslint-disable no-control-regex */

import { AssertionError } from "../error/AssertionError.js";
import { formatDate, isDate } from "./date.js";
import { formatData, isData } from "./data.js";
import { getArray, ImmutableArray, isArray } from "./array.js";
import { formatNumber, isBetween } from "./number.js";

/**
 * Type that never matches the `string` type.
 * - `string` itself is iterable (iterating over its individual characters) and implements `Iterable<string>`
 * - Using `Iterable<string> & NotString` allows an iterable containing strings but not `string` itself.
 * - This helps catch this category of subtle errors.
 */
export type NotString = { toUpperCase?: never; toLowerCase?: never };

/** Non-breaking space. */
export const NBSP = "\xA0";

/** Thin space. */
export const THINSP = "\u2009";

/** Non-breaking narrow space (goes between numbers and their corresponding units). */
export const NNBSP = "\u202F";

/** Is a value a string? */
export const isString = (v: unknown): v is string => typeof v === "string";

/** Assert that a value is a string. */
export function assertString(value: unknown): asserts value is string {
	if (typeof value !== "string") throw new AssertionError(`Must be string`, value);
}

/**
 * Convert an unknown value into a title string for user-facing use.
 * - Strings return the string.
 * - Booleans return `"Yes"` or `"No"`
 * - Numbers return formatted number with commas etc (e.g. `formatNumber()`).
 * - Dates return formatted date (e.g. `formatDate()`).
 * - Arrays return the array items converted to string (with `toTitle()`), and joined with a comma.
 * - Objects return...
 *   1. `object.name` if it exists, or
 *   2. `object.title` if it exists.
 * - Falsy values like `null` and `undefined` return `"None"`
 * - Everything else returns `"Unknown"`
 */
export function getString(value: unknown): string {
	if (value === null || value === undefined) return "None";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (typeof value === "string") return value || "None";
	if (typeof value === "number") return formatNumber(value);
	if (typeof value === "symbol") return value.description || "Symbol";
	if (typeof value === "function") return "Function";
	if (isDate(value)) return formatDate(value);
	if (isArray(value)) return value.map(getString).join(", ");
	if (isData(value)) return formatData(value);
	return "Unknown";
}

/** Concatenate an iterable set of strings together. */
export const joinStrings = (strs: Iterable<string> & NotString, joiner = ""): string => getArray(strs).join(joiner);

/**
 * Sanitize a single-line string.
 * - Used when you're sanitising a single-line input, e.g. a title for something.
 * - Remove allow control characters
 * - Normalise runs of whitespace to one ` ` space,
 * - Trim whitespace from the start and end of the string.
 *
 * @example santizeString("\x00Nice!   "); // Returns `"Nice!"`
 */
export const sanitizeString = (str: string): string =>
	str
		.replace(/[^\P{C}\s]/gu, "") // Strip control characters (except whitespace).
		.replace(/\s+/gu, " ") // Normalise runs of whitespace to one ` ` space.
		.trim(); // Trim whitespace from the start and end of the string.

/**
 * Sanitize a multiline string.
 * - Used when you're sanitising a multi-line input, e.g. a description for something.
 * - Remove all control characters except `\n` newline.
 * - Normalise weird characters like paragraph separator, line separator, `\t` tab, `\r` carriage return.
 * - Normalise runs of whitespace to one ` ` space,
 * - Normalise indentation to tabs (four or more spaces are a tab, three or fewer spaces are removed).
 * - Allow spaces at the start of each line (for indentation) but trim the end of each line.
 * - Trim excess newlines at the start and end of the string and runs of more than two newlines in a row.
 *
 * @todo Use lookbehind when Safari supports it, so replacements don't need `$1`
 */
export const sanitizeLines = (str: string): string =>
	str
		.replace(/[^\P{C}\s]/gu, "") // Strip control characters (except whitespace).
		.replace(/\r\n?|\v|\x85|\u2028/g, "\n") // Normalise line separators to `\n` newline
		.replace(/[^\S\n]+(?=\n|$)/g, "") // Trim trailing whitespace on each line.
		.replace(/\f|\u2029/g, "\n\n") // Normalise paragraph separators to `\n\n` double newline.
		.replace(/^\n+|\n+$/g, "") // Trim leading and trailing newlines.
		.replace(/\n{3,}/g, "\n\n") // Normalise `\n\n\n` triple newline (or more) to `\n\n` double newline.
		.replace(/(\S)[^\S\n]+(?=\S)/g, "$1 ") // Normalise runs of whitespace in the middle of each line to one ` ` space.
		.replace(/ {4}/g, "\t") // Normalise runs of `    ` four spaces to a single `\t` tab (this will only exist in indentation because we already stripped it in other places).
		.replace(/(^|\n|\t) +/g, "$1"); // Remove runs  of ` ` space in indentation (will only match three or fewer because four spaces have already been normalised to `\t` tab).

/**
 * Simplify a string by removing anything that isn't a number, letter, or space.
 * - Used when you're running a query against a string entered by a user.
 *
 * @example normalizeString("Däve-is\nREALLY    éxcitable—apparęntly!!!    😂"); // Returns "dave is really excitable apparently"
 */
export const simplifyString = (str: string) =>
	str
		.normalize("NFD") // Convert ligatures (e.g. `ﬀ`) and letters with marks (e.g. `ü`) to separate characters (e.g. `ff` and `u◌̈`)`.
		.replace(/[\s\p{P}\p{S}\p{Z}]+/gu, " ") // Normalise word separators to ` ` space.
		.replace(/[^\p{L}\p{N} ]+/gu, "") // Strip characters that aren't letters, numbers, spaces.
		.trim()
		.toLowerCase();

/**
 * Convert a string to a `kebab-case` URL slug.
 * - Remove any characters not in the range `[a-z0-9-]`
 * - Change all spaces/separators/hyphens/dashes/underscores to `-` single hyphen.
 *
 * Note: this splits words based on spaces, so won't work well with logographic writing systems e.g. kanji.
 */
export const getSlug = (str: string): string => simplifyString(str).replace(/ /g, "-");

/**
 * Return an array of the separate words and "quoted phrases" found in a string.
 * - Phrases enclosed "in quotes" are a single word.
 * - Performs no processing on the words, so control chars, punctuation, symbols, and case are all preserved.
 *
 * Note: this splits words based on spaces, so won't work well with logographic writing systems e.g. kanji.
 */
export const getWords = (str: string): ImmutableArray<string> => Array.from(_getWords(str));
function* _getWords(str: string): Iterable<string> {
	for (const [, a, b, c] of str.matchAll(WORD)) {
		const word = a || b || c;
		if (word) yield word;
	}
}
const WORD = /([^\s"]+)|"([^"]*)"|'([^']*)'/g; // Runs of characters without spaces, or "quoted phrases"

/** Is the first character of a string an uppercase letter? */
export const isUppercaseLetter = (str: string): boolean => isBetween(str.charCodeAt(0), 65, 90);

/** Is the first character of a string a lowercase letter? */
export const isLowercaseLetter = (str: string): boolean => isBetween(str.charCodeAt(0), 97, 122);

/**
 * Limit a string to a given length.
 * - Stops at the last space inside `maxLength`
 * - Appends an `…` ellipses after the string (but only if a limit is applied).
 */
export function limitString(str: string, maxLength: number, append = "…") {
	if (str.length < maxLength) return str;
	const lastSpace = str.lastIndexOf(" ", maxLength);
	return `${str.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}${append}`;
}

/**
 * Divide a string into parts based on a separator.
 * - Like `String.prototype.split()` but with more useful arguments.
 * - Excess segments in `String.prototype.split()` is counterintuitive because further parts are thrown away.
 * - Excess segments in `splitString()` are concatenated onto the last segment (set `maxSegments` to `null` if you want infinite segments).
 *
 * @throws AssertionError if `minSegments` isn't met.
 * @throws AssertionError if any of the segments are empty.
 */
export function splitString(str: string, separator: string, minSegments: 1, maxSegments?: number): readonly [string, ...string[]];
export function splitString(str: string, separator: string, minSegments: 2, maxSegments?: number): readonly [string, string, ...string[]];
export function splitString(str: string, separator: string, minSegments: 3, maxSegments?: number): readonly [string, string, string, ...string[]];
export function splitString(str: string, separator: string, minSegments: 4, maxSegments?: number): readonly [string, string, string, string, ...string[]];
export function splitString(str: string, separator: string, minSegments?: number, maxSegments?: number | null): ImmutableArray<string>;
export function splitString(str: string, separator: string, minSegments = 0, maxSegments: number | null = minSegments): ImmutableArray<string> {
	const segments = str.split(separator);
	if (typeof maxSegments === "number" && segments.length > maxSegments) segments.splice(maxSegments - 1, segments.length, segments.slice(maxSegments - 1).join(separator));
	if (segments.length < minSegments || !segments.every(Boolean)) throw new AssertionError(`Must be string with ${minSegments} non-empty segments separated by "${separator}"`, str);
	return segments;
}
