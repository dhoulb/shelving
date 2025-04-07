import { ValidationError } from "../error/ValidationError.js";
import type { ImmutableArray } from "./array.js";
import { getArray, isArray } from "./array.js";
import { formatDate, isDate } from "./date.js";
import { formatNumber, formatRange, isBetween } from "./number.js";
import { formatObject, isObject } from "./object.js";

/**
 * Type that never matches the `string` type.
 * - `string` itself is iterable (iterating over its individual characters) and implements `Iterable<string>`
 * - Using `Iterable<string> & NotString` allows an iterable containing strings but not `string` itself.
 * - This helps catch this category of subtle errors.
 */
export type NotString = { toUpperCase?: never; toLowerCase?: never };

/** Is a value a string? */
export function isString(value: unknown): value is string {
	return typeof value === "string";
}

/** Assert that a value is a string. */
export function assertString(value: unknown): asserts value is string {
	if (typeof value !== "string") throw new ValidationError("Must be string", value);
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
	if (isObject(value)) return formatObject(value);
	return "Unknown";
}

/** Does a string have the specified minimum length.  */
export function isStringLength(str: string, min = 1, max = Number.POSITIVE_INFINITY): boolean {
	return str.length >= min && str.length <= max;
}

/** Assert that a value has a specific length (or length is in a specific range). */
export function assertStringLength(str: unknown, min = 1, max = Number.POSITIVE_INFINITY): asserts str is string {
	if (!isString(str) || !isStringLength(str, min, max))
		throw new ValidationError(`Must be string with length ${formatRange(min, max)}`, str);
}

/** Get a string if it has the specified minimum length.  */
export function getStringLength(str: string, min = 1, max = Number.POSITIVE_INFINITY): string {
	assertStringLength(str, min, max);
	return str;
}

/** Concatenate an iterable set of strings together. */
export function joinStrings(strs: Iterable<string> & NotString, joiner = ""): string {
	return getArray(strs).join(joiner);
}

/**
 * Sanitize a single line of text.
 * - Used when you're sanitising a single-line input, e.g. a title for something.
 * - Remove allow control characters
 * - Normalise runs of whitespace to one ` ` space,
 * - Trim whitespace from the start and end of the string.
 *
 * @example santizeString("\x00Nice!   "); // Returns `"Nice!"`
 */
export function sanitizeText(str: string): string {
	return str
		.replace(/[^\P{C}\s]/gu, "") // Strip control characters (except whitespace).
		.replace(/\s+/gu, " ") // Normalise runs of whitespace to one ` ` space.
		.trim(); // Trim whitespace from the start and end of the string.
}

/**
 * Sanitize multiple lines of text.
 * - Used when you're sanitising a multi-line input, e.g. a description for something.
 * - Remove all control characters except `\n` newline.
 * - Normalise weird characters like paragraph separator, line separator, `\t` tab, `\r` carriage return.
 * - Normalise runs of whitespace to one ` ` space,
 * - Normalise indentation to tabs (four or more spaces are a tab, three or fewer spaces are removed).
 * - Allow spaces at the start of each line (for indentation) but trim the end of each line.
 * - Trim excess newlines at the start and end of the string and runs of more than two newlines in a row.
 */
export function sanitizeMultilineText(str: string): string {
	return str
		.replace(/[^\P{C}\s]/gu, "") // Strip control characters (except whitespace).
		.replace(/\r\n?|\v|\x85|\u2028/g, "\n") // Normalise line separators to `\n` newline
		.replace(/\f|\u2029/g, "\n\n") // Normalise paragraph separators to `\n\n` double newline.
		.replace(/[^\S\n]+(?=\n|$)/g, "") // Trim trailing whitespace on each line.
		.replace(/^\n+|\n+$/g, "") // Trim leading and trailing newlines.
		.replace(/\n{3,}/g, "\n\n") // Normalise three or more `\n\n\n` newline to `\n\n` double newline.
		.replace(/(\S)[^\S\n]+/g, "$1 ") // Normalise runs of non-leading whitespace to ` ` single space.
		.replace(/[^\S\t\n]{4}/g, "\t") // Normalise leading `    ` four whitespace characters to a single `\t` tab.
		.replace(/(^|\t|\n)[^\S\t\n]+/g, "$1"); // Remove leading whitespace that isn't a tab.
}

/**
 * Simplify a string by removing anything that isn't a number, letter, or space.
 * - Normalizes the string by
 * - Useful when you're running a query against a string entered by a user.
 *
 * @example simplifyString("Däve-is\nREALLY    éxcitable—apparęntly!!!    😂"); // Returns "dave is really excitable apparently"
 *
 * @todo Convert confusables (e.g. `ℵ` alef symbol or `℮` estimate symbol) to their letterlike equivalent (e.g. `N` and `e`).
 */
export function simplifyString(str: string): string {
	return str
		.normalize("NFKD") // Normalize ligatures (e.g. `ﬀ` to `ff`), combined characters (e.g. `Ⓜ` to `m`), accents (e.g. `å` to `a`).
		.replace(/[^\p{L}\p{N}\p{Z}\p{Pc}\p{Pd}]+/gu, "") // Strip characters that aren't `\p{L}` letters, `\p{N}` numbers, `\p{Z}` separators (e.g. ` ` space), `\p{Pc}` connector punctuation (e.g. `_` underscore_, `\p{Pd}` dash punctuation (e.g. `-` hyphen)
		.replace(/[\p{Z}\p{Pc}\p{Pd}]+/gu, " ") // Normalise runs of `\p{Z}` separators (e.g. ` ` space), `\p{Pc}` connector punctuation (e.g. `_` underscore_, `\p{Pd}` dash punctuation (e.g. `-` hyphen), to ` ` single space.
		.trim()
		.toLowerCase();
}

/**
 * Convert a string to a `kebab-case` URL slug, or return `undefined` if conversion resulted in an empty ref.
 */
export function getOptionalSlug(str: string): string | undefined {
	return simplifyString(str).replaceAll(" ", "-") || undefined;
}

/**
 * Convert a string to a `kebab-case` URL slug, or throw `ValueError` if conversion resulted in an empty ref.
 */
export function getSlug(str: string): string {
	const slug = getOptionalSlug(str);
	if (slug) return slug;
	throw new ValidationError("Invalid slug", str);
}

/**
 * Convert a string to a unique ref e.g. `abc123`, or return `undefined` if conversion resulted in an empty string.
 */
export function getOptionalRef(str: string): string | undefined {
	return simplifyString(str).replaceAll(" ", "") || undefined;
}

/**
 * Convert a string to a unique ref e.g. `abc123`, or throw `ValueError` if conversion resulted in an empty string.
 */
export function getRef(str: string): string {
	const ref = getOptionalRef(str);
	if (ref) return ref;
	throw new ValidationError("Invalid string ref", str);
}

/**
 * Return an array of the separate words and "quoted phrases" found in a string.
 * - Phrases enclosed "in quotes" are a single word.
 * - Performs no processing on the words, so control chars, punctuation, symbols, and case are all preserved.
 *
 * Note: this splits words based on spaces, so won't work well with logographic writing systems e.g. kanji.
 */
export function getWords(str: string): ImmutableArray<string> {
	return Array.from(_getWords(str));
}
function* _getWords(str: string): Iterable<string> {
	for (const [, a, b, c] of str.matchAll(WORD)) {
		const word = a || b || c;
		if (word) yield word;
	}
}
const WORD = /([^\s"]+)|"([^"]*)"|'([^']*)'/g; // Runs of characters without spaces, or "quoted phrases"

/** Get the (trimmed) first full line of a string. */
export function getFirstLine(str: string): string {
	const i = str.indexOf("\n");
	return (i >= 0 ? str.substr(0, i) : str).trim();
}

/** Is the first character of a string an uppercase letter? */
export function isUppercaseLetter(str: string): boolean {
	return isBetween(str.charCodeAt(0), 65, 90);
}

/** Is the first character of a string a lowercase letter? */
export function isLowercaseLetter(str: string): boolean {
	return isBetween(str.charCodeAt(0), 97, 122);
}

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
 * - Excess segments in `splitString()` are concatenated onto the last segment (set `max` to `null` if you want infinite segments).
 *
 * @throws ValueError if `min` isn't met.
 * @throws ValueError if any of the segments are empty.
 */
export function splitString(str: string, separator: string, min: 1, max: 1): readonly [string];
export function splitString(str: string, separator: string, min: 2, max: 2): readonly [string, string];
export function splitString(str: string, separator: string, min: 3, max: 3): readonly [string, string, string];
export function splitString(str: string, separator: string, min: 4, max: 4): readonly [string, string, string, string];
export function splitString(str: string, separator: string, min?: 1, max?: number): readonly [string, ...string[]];
export function splitString(str: string, separator: string, min: 2, max?: number): readonly [string, string, ...string[]];
export function splitString(str: string, separator: string, min: 3, max?: number): readonly [string, string, string, ...string[]];
export function splitString(str: string, separator: string, min: 4, max?: number): readonly [string, string, string, string, ...string[]];
export function splitString(str: string, separator: string, min?: number, max?: number): ImmutableArray<string>;
export function splitString(str: string, separator: string, min = 1, max = Number.POSITIVE_INFINITY): ImmutableArray<string> {
	const segments = str.split(separator);
	if (segments.length > max) segments.splice(max - 1, segments.length, segments.slice(max - 1).join(separator));
	if (segments.length < min || !segments.every(Boolean))
		throw new ValidationError(`Must be string with ${formatRange(min, max)} non-empty segments separated by "${separator}"`, str);
	return segments;
}
