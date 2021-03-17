import { formatDate, toYmd } from "../date";
import { isObject } from "../object";
import { ImmutableArray, isArray, MutableArray } from "../array";
import { formatNumber } from "../number";

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

/** Convert a string to a `kebab-case` slug. */
export const toSlug = (value: string): string => value.toLowerCase().replace(TO_HYPHEN, "-").replace(TRIM_HYPHENS, "");
const TO_HYPHEN = /[^a-z0-9]+/g; // Anything that isn't [a-z0-9] becomes a hyphen.
const TRIM_HYPHENS = /^-|-$/g; // Trim excess hyphens at start and end.

/**
 * Split a string into its separate words.
 * - Words enclosed "in quotes" are a single word.
 *
 * @param value The input string.
 */
export const toWords = (value: string): ImmutableArray<string> => {
	const words: MutableArray<string> = [];
	for (const matches of value.matchAll(MATCH_WORD)) words.push(matches[1] || (matches[0] as string));
	return words;
};
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
