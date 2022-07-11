/* eslint-disable no-control-regex */

import { AssertionError } from "../error/AssertionError.js";
import { formatDate } from "./date.js";
import { isData } from "./data.js";
import { getArray, ImmutableArray, isArray } from "./array.js";
import { formatNumber, isBetween } from "./number.js";

/** Non-breaking space. */
export const NBSP = "\xA0";

/** Thin space. */
export const THINSP = "\u2009";

/** Non-breaking narrow space. */
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
	if (value instanceof Date) return formatDate(value);
	if (isArray(value)) return value.map(getTitle).join(", ");
	if (isData(value)) {
		if ("name" in value) return getTitle(value.name);
		if ("title" in value) return getTitle(value.title);
	}
	if (!value) return "None";
	return "Unknown";
}

/** Concatenate an iterable set of strings together. */
export const joinStrings = (strs: Iterable<string>, joiner = ""): string => getArray(strs).join(joiner);

/**
 * Sanitize unexpected characters from a string by:
 * - Stripping control characters.
 * - Normalising all space characters to " " space.
 *
 * @param str The dirty input string.
 * @param multiline If `true`, `\t` horizontal tabs and `\r` newlines are allowed (defaults to `false` which strips these characters).
 * @returns The clean output string.
 */
export const sanitizeString = (str: string): string => str.replace(SANE_SPACES, " ").replace(SANE_STRIP, "").trim();
const SANE_SPACES = /\s+/g; // Runs of spaces.
const SANE_STRIP = /[\x00-\x1F\x7F-\x9F]+/g; // Control characters.

/**
 * Sanitize a multiline string.
 * - Like `sanitizeString()` but allows `\t` horizontal tab and `\r` newline.
 */
export const sanitizeLines = (str: string): string => str.replace("\u2029", "\n\n").replace(LINE_SPACES, " ").replace(LINE_STRIP, "").replace(LINE_ENDS, "").replace(LINE_START, "").replace(LINE_BREAKS, "\n\n");
const LINE_SPACES = /[^\S \t\n]/g; // Spaces except tab and newline.
const LINE_STRIP = /[\x00-\x08\x0B-\x1F\x7F-\x9F]+/g; // Control characters (except tab and newline).
const LINE_ENDS = /[ \t]+$/gm; // Spaces and tabs at ends of lines.
const LINE_START = /^\n+|\n+$/g; // Newlines at start and end of string.
const LINE_BREAKS = /\n\n\n+/g; // Three or more linebreaks in a row.

/**
 * Normalize a string so it can be compared to another string (free from upper/lower cases, symbols, punctuation).
 *
 * Does the following:
 * - Removes control characters.
 * - Remove symbols (e.g. `$` dollar) and punctuation (e.g. `"` double quote).
 * - Remove marks (e.g. the umlout dots above `ö`).
 * - Convert spaces/separators to " " single space (e.g. line breaks, non-breaking space).
 * - Convert to lowercase and trim excess whitespace.
 *
 * @example normalizeString("Däve-is\nREALLY    éxcitable—apparęntly!!!    😂"); // Returns "dave is really excitable apparently"
 */
export const normalizeString = (str: string) => sanitizeString(str.normalize("NFD").replace(NORMAL_STRIP, "").toLowerCase());
const NORMAL_STRIP = /[^\p{L}\p{N}\s]+/gu; // Anything except letters, numbers, spaces.

/**
 * Convert a string to a `kebab-case` URL slug.
 * - Remove any characters not in the range `[a-z0-9-]`
 * - Change all spaces/separators/hyphens/dashes/underscores to `-` single hyphen.
 */
export const getSlug = (str: string): string => str.toLowerCase().normalize("NFD").replace(SLUG_HYPHENS, "-").replace(SLUG_STRIP, "");
const SLUG_HYPHENS = /[\s\-–—_]+/gu; // Runs of spaces and hyphens.
const SLUG_STRIP = /^[^a-z0-9]+|[^a-z0-9]+$|[^a-z0-9-]+/g; // Non-alphanumeric or hyphen anywhere, or non-alphanumeric at start and end.

/**
 * Split a string into its separate words.
 * - Words enclosed "in quotes" are a single word.
 * - Performs no processing on the words, so control chars, punctuation, symbols, and case are all preserved.
 *
 * @param str The input string, e.g. `yellow dog   "Golden Retriever"`
 * @returns Array of the found words, e.g. `["yellow", "dog", "Golden Retriever"
 */
export const getWords = (str: string): ImmutableArray<string> => Array.from(yieldWords(str));

/** Find and iterate over the words in a string. */
export function* yieldWords(value: string): Generator<string, void, void> {
	for (const matches of value.matchAll(MATCH_WORD)) {
		const str = matches[1] || matches[0];
		if (str) yield str;
	}
}
const MATCH_WORD = /[^\s"]+|"([^"]*)"/g; // Runs of characters without spaces, or "quoted phrases"

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
