import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import type { ImmutableArray } from "./array.js";
import { requireArray } from "./array.js";
import type { AnyCaller } from "./function.js";
import { isBetween } from "./number.js";

/**
 * Type that never matches the `string` type.
 * - `string` itself is iterable (iterating over its individual characters) and implements `Iterable<string>`
 * - Using `Iterable<string> & NotString` allows an iterable containing strings but not `string` itself.
 * - This helps catch this category of subtle errors.
 */
export type NotString = { toUpperCase?: never; toLowerCase?: never };

/** Things that can be easily converted to a string. */
export type PossibleString = string | number | Date;

/** Is a value a string (optionally with specified min/max length). */
export function isString(value: unknown, min = 0, max = Number.POSITIVE_INFINITY): value is string {
	return typeof value === "string" && value.length >= min && value.length <= max;
}

/** Assert that a value is a string (optionally with specified min/max length). */
export function assertString(value: unknown, min?: number, max?: number, caller: AnyCaller = assertString): asserts value is string {
	if (!isString(value, min, max))
		throw new RequiredError(
			`Must be string${min !== undefined || max !== undefined ? ` with ${min ?? 0} to ${max ?? "∞"} characters` : ""}`,
			{
				received: value,
				caller,
			},
		);
}

/** Convert an unknown value to a string, or return `undefined` if conversion fails. */
export function getString(value: unknown): string | undefined {
	if (typeof value === "string") return value;
	if (typeof value === "number") return value.toString();
	if (value instanceof Date) return value.toISOString();
	return undefined;
}

/** Convert a possible string to a string (optionally with specified min/max length), or throw `RequiredError` if conversion fails. */
export function requireString(value: PossibleString, min?: number, max?: number, caller: AnyCaller = requireString): string {
	const str = getString(value);
	assertString(str, min, max, caller);
	return str;
}

/** Does a string have a length between `min` and `max` */
export function isStringBetween(str: string, min = 0, max = Number.POSITIVE_INFINITY): boolean {
	return str.length >= min && str.length <= max;
}

/** Concatenate an iterable set of strings together. */
export function joinStrings(strs: Iterable<string> & NotString, joiner = ""): string {
	return requireArray(strs, undefined, undefined, joinStrings).join(joiner);
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

/** Convert a string to a `kebab-case` URL slug, or return `undefined` if conversion resulted in an empty ref. */
export function getSlug(str: string): string | undefined {
	return simplifyString(str).replaceAll(" ", "-") || undefined;
}

/** Convert a string to a `kebab-case` URL slug, or throw `RequiredError` if conversion resulted in an empty ref. */
export function requireSlug(str: string, caller: AnyCaller = requireSlug): string {
	const slug = getSlug(str);
	if (!slug) throw new RequiredError("Invalid slug", { received: str, caller });
	return slug;
}

/** Convert a string to a unique ref e.g. `abc123`, or return `undefined` if conversion resulted in an empty string. */
export function getRef(str: string): string | undefined {
	return simplifyString(str).replaceAll(" ", "") || undefined;
}

/** Convert a string to a unique ref e.g. `abc123`, or throw `RequiredError` if conversion resulted in an empty string. */
export function requireRef(str: string, caller: AnyCaller = requireRef): string {
	const ref = getRef(str);
	if (!ref) throw new RequiredError("Invalid string ref", { received: str, caller });
	return ref;
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
 * @throws RequiredError if `min` isn't met.
 * @throws RequiredError if any of the segments are empty.
 */
export function splitString(str: string, separator: string, min: 1, max: 1, caller?: AnyCaller): readonly [string];
export function splitString(str: string, separator: string, min: 2, max: 2, caller?: AnyCaller): readonly [string, string];
export function splitString(str: string, separator: string, min: 3, max: 3, caller?: AnyCaller): readonly [string, string, string];
export function splitString(str: string, separator: string, min: 4, max: 4, caller?: AnyCaller): readonly [string, string, string, string];
export function splitString(str: string, separator: string, min?: 1, max?: number, caller?: AnyCaller): readonly [string, ...string[]];
export function splitString(
	str: string,
	separator: string,
	min: 2,
	max?: number,
	caller?: AnyCaller,
): readonly [string, string, ...string[]];
export function splitString(
	str: string,
	separator: string,
	min: 3,
	max?: number,
	caller?: AnyCaller,
): readonly [string, string, string, ...string[]];
export function splitString(
	str: string,
	separator: string,
	min: 4,
	max?: number,
	caller?: AnyCaller,
): readonly [string, string, string, string, ...string[]];
export function splitString(str: string, separator: string, min?: number, max?: number, caller?: AnyCaller): ImmutableArray<string>;
export function splitString(
	str: string,
	separator: string,
	min = 1,
	max = Number.POSITIVE_INFINITY,
	caller: AnyCaller = splitString,
): ImmutableArray<string> {
	const segments = str.split(separator);
	if (segments.length > max) segments.splice(max - 1, segments.length, segments.slice(max - 1).join(separator));
	if (segments.length < min || !segments.every(Boolean))
		throw new ValueError(`Must be string with ${min ?? 0} to ${max ?? "∞"} non-empty segments separated by "${separator}"`, {
			received: str,
			caller,
		});
	return segments;
}
