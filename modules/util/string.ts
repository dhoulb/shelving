/* eslint-disable no-control-regex */

import { formatDate } from "./date.js";
import { isData } from "./data.js";
import { ImmutableArray, isArray } from "./array.js";
import { formatNumber, isBetween } from "./number.js";

/** Is a value a string? */
export const IS_STRING = (v: unknown): v is string => typeof v === "string";

/**
 * Convert an unknown value into a string for internal use.
 * - Objects use `obj.toString()` as long as it's not the default `Object.toString()` which is garbage.
 * - Primitives return `true`, `false`, `null`, `undefined`
 * - Numbers return the stringified number.
 *
 * -
 */
export function toString(value: unknown): string {
	if (typeof value === "object")
		return value === null ? "null" : typeof value.toString === "function" && value.toString !== Object.prototype.toString ? value.toString() : "object";
	if (typeof value === "string") return value;
	if (typeof value === "boolean") return value.toString();
	if (typeof value === "number") return value.toString();
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
export function toTitle(value: unknown): string {
	if (typeof value === "string") return value ? value : "None";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (typeof value === "number") return formatNumber(value);
	if (value instanceof Date) return formatDate(value);
	if (isArray(value)) return value.map(toTitle).join(", ");
	if (isData(value)) {
		if ("name" in value) return toTitle(value.name);
		if ("title" in value) return toTitle(value.title);
	}
	if (!value) return "None";
	return "Unknown";
}

/**
 * Sanitize unexpected characters from a string by:
 * - Stripping control characters.
 * - Normalising all space characters to " " space.
 *
 * @param dirty The dirty input string.
 * @param multiline If `true`, `\t` horizontal tabs and `\r` newlines are allowed (defaults to `false` which strips these characters).
 * @returns The clean output string.
 */
export const sanitizeString = (dirty: string): string => dirty.replace(SANE_DISALLOWED, "").replace(SANE_SPACES, " ").trim();
const SANE_DISALLOWED = /[\x00-\x1F\x7F-\x9F]/g; // All control characters (`\x00`-`\x1F`, `\x7F`-`\x9F`)
const SANE_SPACES = /\s/g; // Zero-width spacers etc.

/**
 * Sanitize a multiline string.
 * - Like `sanitizeString()` but allows `\t` horizontal tab and `\r` newline.
 */
export const sanitizeLines = (dirty: string): string => dirty.replace(LINES_DISALLOW, "").replace(LINES_SPACES, " ").replace(LINES_TRIM, "");
const LINES_DISALLOW = /(?![\t\n])[\x00-\x1F\x7F-\x9F]/g; // Control characters except `\t` horizontal tab and `\n` new line.
const LINES_TRIM = /\s+$/gm; // Spaces at the end of lines.
const LINES_SPACES = /(?![\t\n])\s/g; // All spaces except `\t` horizontal tab and `\n` new line.

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
export const normalizeString = (str: string) => str.normalize("NFD").replace(NORMAL_DISALLOW, "").replace(NORMAL_SPACES, " ").trim().toLowerCase();
const NORMAL_DISALLOW = /[^\p{L}\p{N}\s]+/gu; // Keep letters, numbers, separators. Don't need to use `\p{Z}` because `\s` matches those already e.g. hair space and nbsp.
const NORMAL_SPACES = /\s+/gu; // Convert all possible separators to space.

/**
 * Convert a string to a `kebab-case` URL slug.
 * - Remove any characters not in the range `[a-z0-9-]`
 * - Change all spaces/separators/hyphens/dashes/underscores to `-` single hyphen.
 */
export const toSlug = (value: string): string => value.toLowerCase().normalize("NFD").replace(SLUG_HYPHENS, "-").replace(SLUG_DISALLOWED, "");
const SLUG_DISALLOWED = /[^a-z0-9-]+|^-+|-+$/gu; // Remove anything outside a-z and hyphen (except at start/end).
const SLUG_HYPHENS = /[\s\-–—_]+/gu; // Anything that is a space becomes a hyphen.

/**
 * Split a string into its separate words.
 * - Words enclosed "in quotes" are a single word.
 * - Performs no processing on the words, so control chars, punctuation, symbols, and case are all preserved.
 *
 * @param value The input string, e.g. `yellow dog   "Golden Retriever"`
 * @returns Array of the found words, e.g. `["yellow", "dog", "Golden Retriever"
 */
export const toWords = (value: string): ImmutableArray<string> => Array.from(yieldWords(value));

/** Find and iterate over the words in a string. */
export function* yieldWords(value: string): Generator<string, void, void> {
	for (const matches of value.matchAll(MATCH_WORD)) {
		const str = matches[1] || matches[0];
		if (str) yield str;
	}
}
const MATCH_WORD = /[^\s"]+|"([^"]*)"/g;

/**
 * Convert a string to a regular expression that matches that string.
 *
 * @param value The input string.
 * @param flags RegExp flags that are passed into the created RegExp.
 */
export const toRegExp = (value: string, flags = ""): RegExp => new RegExp(escapeRegExp(value), flags);

/** Escape special characters in a string regular expression. */
export const escapeRegExp = (str: string): string => str.replace(REPLACE_ESCAPED, "\\$&");
const REPLACE_ESCAPED = /[-[\]/{}()*+?.\\^$|]/g;

/** Is the first character of a string an uppercase letter? */
export const isUppercaseLetter = (str: string): boolean => isBetween(str.charCodeAt(0), 65, 90);

/** Is the first character of a string a lowercase letter? */
export const isLowercaseLetter = (str: string): boolean => isBetween(str.charCodeAt(0), 97, 122);
