/* eslint-disable no-control-regex */

import { formatDate, toYmd } from "../date";
import { isObject } from "../object";
import { ImmutableArray, isArray, mapItems } from "../array";
import { formatNumber } from "../number";
import { SKIP } from "../constants";

/** Is a value a string? */
export const isString = (v: unknown): v is string => typeof v === "string";

/**
 * Convert an unknown value into a string.
 *
 * Conversion rules:
 * - Strings return the same string.
 * - Numbers return formatted number (e.g. `number.toString()`).
 * - Dates return YMD date (e.g. `getYMD()` e.g. "2015-09-21").
 * - Everything else returns `""` empty string.
 */
export const toString = (value: unknown): string => {
	if (typeof value === "string") return value;
	if (typeof value === "number") return value.toString();
	if (value instanceof Date) return toYmd(value) || "";
	return ""; // Convert everything else to empty string.
};

/**
 * Convert an unknown value into a title string.
 *
 * Conversion rules:
 * - Strings return the same string.
 * - Booleans return `"Yes"` or `"No"`
 * - Numbers return formatted number (e.g. `formatNumber()`).
 * - Dates return formatted date (e.g. `formatDate()`).
 * - Arrays return the array items converted to string (with `toString()`), and joined with a comma.
 * - Objects return...
 *   1. `object.name` if it exists, or
 *   2. `object.title` if it exists.
 * - Everything else returns `"Unknown"`
 */
export const toTitle = (value: unknown): string => {
	if (typeof value === "string") return value ? value : "None";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (typeof value === "number") return formatNumber(value);
	if (value instanceof Date) return formatDate(value);
	if (isArray(value)) return value.map(toTitle).join(", ");
	if (isObject(value)) {
		if ("name" in value) return toTitle(value.name);
		if ("title" in value) return toTitle(value.title);
	}
	if (!value) return "None";
	return "Unknown";
};

/**
 * Sanitize unexpected characters from a string by:
 * - Stripping control characters.
 * - Normalising all space characters to " " space.
 *
 * @param value The dirty input string.
 * @param multiline If `true`, `\t` horizontal tabs and `\r` newlines are allowed (defaults to `false` which strips these characters).
 * @returns The clean output string.
 */
export const sanitizeString = (value: string): string => value.replace(CONTROLS, "").replace(SPACES, " ");
const SPACES = /\s/g; // All spaces.
const CONTROLS = /[\x00-\x1F\x7F-\x9F]/g; // All control characters (`\x00`-`\x1F`, `\x7F`-`\x9F`)

/**
 * Sanitize a multiline string.
 * - Like `sanitizeString()` but allos `\t` horizontal tab and `\r` newline.
 */
export const sanitizeLines = (value: string): string => value.replace(CONTROLS_MULTILINE, "").replace(SPACES_MULTILINE, " ");
const SPACES_MULTILINE = /(?![\t\n])\s/g; // All spaces except `\r` horizontal tab and `\n` new line.
const CONTROLS_MULTILINE = /(?![\t\n])[\x00-\x1F\x7F-\x9F]/g; // Control characters except `\t` horizontal tab and `\n` new line.

/**
 * Normalize a string so it can be compared to another string (free from upper/lower cases, symbols, punctuation).
 *
 * Does the following:
 * - Santize the string to remove control characters.
 * - Remove symbols (e.g. `$` dollar).
 * - Remove marks (e.g. the umlout dots above `ö`).
 * - Convert spaces/separators/punctuation to " " single space (e.g. line breaks, non-breaking space, dashes, full stops).
 * - Convert to lowercase and trim excess whitespace.
 *
 * @example normalizeString("Däve-is REALLY éxcitable—apparęntly!!!    😂"); // Returns "dave is really excitable apparently"
 */
export const normalizeString = (value: string): string =>
	sanitizeString(value).normalize("NFD").replace(STRIP, "").replace(SEPARATORS, " ").trim().toLowerCase();
const STRIP = /[\p{Symbol}\p{Mark}]+/gu;
const SEPARATORS = /[\s\p{Punctuation}]+/gu;

/**
 * Convert a string to a `kebab-case` URL slug.
 * - Change all characters not in the range (a-z)
 */
export const toSlug = (value: string): string => value.toLowerCase().replace(NON_ALPHANUMERIC, "-").replace(TRIM_HYPHENS, "");
const NON_ALPHANUMERIC = /[^a-z0-9]+/g; // Anything that isn't [a-z0-9] becomes a hyphen.
const TRIM_HYPHENS = /^-+|-+$/g; // Trim excess hyphens at start and end.

/**
 * Split a string into its separate words.
 * - Words enclosed "in quotes" are a single word.
 * - Performs no processing on the words, so control chars, punctuation, symbols, and case are all preserved.
 *
 * @param value The input string, e.g. `yellow dog   "Golden Retriever"`
 * @returns Array of the found words, e.g. `["yellow", "dog", "Golden Retriever"
 */
export const toWords = (value: string): ImmutableArray<string> => mapItems(value.matchAll(MATCH_WORD), toWord);
const toWord = (matches: RegExpMatchArray) => matches[1] || matches[0] || SKIP;
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
