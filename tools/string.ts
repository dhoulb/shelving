import { formatDate, toYmd } from "./date";
import { isObject } from "./object";
import { isArray } from "./array";
import { formatNumber } from "./number";

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

const R_SPACES = /[^a-z0-9]+/g; // Runs of non alphanumeric characters.
const R_STRIP = /^-|-$/g; // Strip hyphen at start and end.

/** Convert a string to a `kebab-case` slug. */
export const toSlug = (value: string): string => value.toLowerCase().replace(R_SPACES, "-").replace(R_STRIP, "");
