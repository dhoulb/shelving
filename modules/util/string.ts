/* eslint-disable no-control-regex */

import { AssertionError } from "../error/AssertionError.js";
import { formatDate, isDate } from "./date.js";
import { isData } from "./data.js";
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
 * Convert an unknown value into a string for internal use.
 * - Objects use `obj.toString()` as long as it's not the default `Object.toString()` which is garbage.
 * - Primitives return `true`, `false`, `null`, `undefined`
 * - Numbers return the stringified number.
 */
export function getString(value: unknown): string {
	if (typeof value === "string") return value;
	if (typeof value === "number") return value.toString();
	if (typeof value === "object") return value === null ? "null" : typeof value.toString === "function" && value.toString !== Object.prototype.toString ? value.toString() : "object";
	if (typeof value === "boolean") return value.toString();
	if (typeof value === "function") return value.name || "function";
	return typeof value; // "symbol" etc.
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
export function getTitle(value: unknown): string {
	if (typeof value === "string") return value ? value : "None";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (typeof value === "number") return formatNumber(value);
	if (isDate(value)) return formatDate(value);
	if (isArray(value)) return value.map(getTitle).join(", ");
	if (isData(value)) {
		if ("name" in value) return getTitle(value.name);
		if ("title" in value) return getTitle(value.title);
	}
	if (!value) return "None";
	return "Unknown";
}

/** Concatenate an iterable set of strings together. */
export const joinStrings = (strs: Iterable<string> & NotString, joiner = ""): string => getArray(strs).join(joiner);

// Regular expressions.
const MATCH_CONTROL_CHARS = /[\x00-\x1F\x7F-\x9F]/g; // Match control characters.
const MATCH_LINE_CONTROL_CHARS = /[\x00-\x08\x0B-\x1F\x7F-\x9F]/g; // Match control characters except `\n` newline and `\t` tab.
const MATCH_PARAGRAPH_SEPARATOR = /\n\n+|\f|\u2029/g; // Match indications of paragraph separation.
const MATCH_LINE_SEPARATOR = /\r\n?|\n|\v|\x85|\u2028/g; // Match indications of line separation.
const MATCH_WORD_SEPARATOR = /[\s\p{P}\p{S}\p{Z}]+/gu; // Match indications of word separation.
const MATCH_WHITESPACE = /\s+/g; // Match runs of whitespace characters.
const MATCH_TRAILING_WHITESPACE = /[^\S\n]+(?=\n)|\s+$/g; // Trailing whitespace at the end of a line or the whole string.
const MATCH_NON_TEXT = /[^\p{L}\p{N} ]+/gu; // Match any characters that isn't a letter, number, or ` ` space.
const MATCH_LEADING_NEWLINES = /^\n+/g; // `\n` newline characters at the start of the string.
// const MATCH_TRAILING_NEWLINES = /\n+$/g; // `\n` newline characters at the end of the string.
const MATCH_FOUR_SPACES = / {4}/g; // Match a run of four whitespace characters.

/**
 * Sanitize a single-line string.
 * - Used when you're sanitising a single-line input, e.g. a title for something.
 * - Remove allow control characters
 * - Normalise runs of whitespace to one ` ` space,
 * - Trim whitespace from the start and end of the string.
 * @example santizeString("\x00Nice!   "); // Returns `"Nice!"`
 */
export const sanitizeString = (str: string): string =>
	str
		.replace(MATCH_WHITESPACE, " ") // Normalise runs of all whitespace to one ` ` space.
		.replace(MATCH_CONTROL_CHARS, "") // Strip control characters.
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
 * @todo Use lookbehind when Safari supports it to fix the replacements
 */
export const sanitizeLines = (str: string): string =>
	str
		.replace(MATCH_TRAILING_WHITESPACE, "") // Trim whitespace from the end of each line and the end of the string.
		.replace(MATCH_LEADING_NEWLINES, "") // Trim excess newlines at the start of the string (no need to trim trailing newlines because it was matched as trailing whitespace).
		.replace(MATCH_LINE_SEPARATOR, "\n") // Normalise all line separators to `\n` newline
		.replace(MATCH_PARAGRAPH_SEPARATOR, "\n\n") // Normalise all paragraph separators to `\n\n` double newline.
		.replace(/(\S)[^\S\n]+(?=\S)/g, "$1 ") // Normalise runs of whitespace to one ` ` space (except indentation at the beginning of a line, by only matching runs after a non-space character).
		.replace(MATCH_FOUR_SPACES, "\t") // Normalise runs of `    ` four spaces to a single `\t` tab (this will only exist in indentation because we already stripped it in other places).
		.replace(/(^|\n|\t) +/g, "$1") // Remove runs  of ` ` space in indentation (will only match three or fewer because four spaces have already been normalised to `\t` tab).
		.replace(MATCH_LINE_CONTROL_CHARS, ""); // Strip control characters (except newline).

/**
 * Simplify a string by removing anything that isn't a number, letter, or space.
 * - Used when you're running a query against a string entered by a user.
 *
 * @example normalizeString("Däve-is\nREALLY    éxcitable—apparęntly!!!    😂"); // Returns "dave is really excitable apparently"
 */
export const simplifyString = (str: string) =>
	str
		.normalize("NFD") // Convert ligatures (e.g. `ﬀ`) and letters with marks (e.g. `ü`) to separate characters (e.g. `ff` and `u◌̈`)`.
		.replace(MATCH_WORD_SEPARATOR, " ") // Normalise word separators to ` ` space.
		.replace(MATCH_NON_TEXT, "") // Strip characters that aren't letters, numbers, spaces.
		.trim()
		.toLowerCase();

/**
 * Convert a string to a `kebab-case` URL slug.
 * - Remove any characters not in the range `[a-z0-9-]`
 * - Change all spaces/separators/hyphens/dashes/underscores to `-` single hyphen.
 *
 * Note: this splits words based on spaces, so won't work well with logographic writing systems e.g. kanji.
 */
export const getSlug = (str: string): string => simplifyString(str).replace(MATCH_WHITESPACE, "-");

/**
 * Return an array of the separate words and "quoted phrases" found in a string.
 * - Phrases enclosed "in quotes" are a single word.
 * - Performs no processing on the words, so control chars, punctuation, symbols, and case are all preserved.
 */
export const getWords = (str: string): ImmutableArray<string> => Array.from(yieldWords(str));

/**
 * Find and iterate over the separate words and "quoted phrases" in a string.
 * - Phrases enclosed "in quotes" are a single word.
 * - Performs no processing on the words, so control chars, punctuation, symbols, and case are all preserved.
 *
 * Note: this splits words based on spaces, so won't work well with logographic writing systems e.g. kanji.
 */
export function* yieldWords(str: string): Iterable<string> {
	for (const [, word, phrase] of str.matchAll(MATCH_WORD)) {
		if (phrase) yield phrase;
		else if (word) yield word;
	}
}
const MATCH_WORD = /([^\s"]+)|"([^"]*)"|'([^']*)'/g; // Runs of characters without spaces, or "quoted phrases"

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
