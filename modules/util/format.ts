import { type ImmutableArray, isArray } from "./array.js";
import { NNBSP } from "./constants.js";
import { isDate, type PossibleDate, requireDate } from "./date.js";
import { getPercent } from "./number.js";
import { type ImmutableObject, isObject } from "./object.js";
import { type PossibleURL, requireURL } from "./url.js";

/** Format a number range (based on the user's browser language settings). */
export function formatRange(min: number, max: number, options?: Intl.NumberFormatOptions): string {
	return `${formatNumber(min, options)}${NNBSP}–${NNBSP}${formatNumber(max, options)}`;
}

/** Format a number with a short suffix, e.g. `1,000 kg` */
export function formatQuantity(num: number, suffix: string, options?: Intl.NumberFormatOptions): string {
	const o: Intl.NumberFormatOptions = { unitDisplay: "short", ...options, style: "decimal" };
	const str = formatNumber(num, o);
	const sep = o.unitDisplay === "narrow" ? "" : NNBSP;
	return `${str}${sep}${suffix}`;
}

/** Format a number (based on the user's browser language settings). */
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
	if (!Number.isFinite(num)) return Number.isNaN(num) ? "-" : "∞";
	return new Intl.NumberFormat(undefined, options).format(num).replace(/ /, NNBSP);
}

/** Format a number with a longer full-word suffix. */
export function pluralizeQuantity(num: number, singular: string, plural: string, options?: Intl.NumberFormatOptions): string {
	const qty = formatNumber(num, {
		...options,
		style: "decimal",
	});
	return `${qty}${NNBSP}${num === 1 ? singular : plural}`;
}

/**
 * Format a percentage (combines `getPercent()` and `formatQuantity()` for convenience).
 * - Defaults to showing no decimal places.
 * - Defaults to rounding closer to zero (so that 99.99% is shown as 99%).
 *
 * @param numerator Number representing the amount of progress.
 * @param denumerator The number representing the whole amount.
 */
export function formatPercent(numerator: number, denumerator: number, options?: Intl.NumberFormatOptions): string {
	return formatNumber(getPercent(numerator, denumerator), {
		maximumFractionDigits: 0,
		roundingMode: "trunc",
		...options,
		style: "percent",
	});
}

/**
 * Format an unknown object as a string.
 * - Use the custom `.toString()` function if it exists (don't use built in `Object.prototype.toString` because it's useless.
 * - Use `.title` or `.name` or `.id` if they exist and are strings.
 * - Use `Object` otherwise.
 */
export function formatObject(obj: ImmutableObject): string {
	if (typeof obj.toString === "function" && obj.toString !== Object.prototype.toString) return obj.toString();
	const name = obj.name;
	if (typeof name === "string") return name;
	const title = obj.title;
	if (typeof title === "string") return title;
	const id = obj.id;
	if (typeof id === "string") return id;
	return "Object";
}

/** Format an unknown array as a string. */
export function formatArray(arr: ImmutableArray<unknown>, separator = ", "): string {
	return arr.map(formatValue).join(separator);
}

/** Format a date in the browser locale. */
export function formatDate(date: PossibleDate, options?: Intl.DateTimeFormatOptions): string {
	return requireDate(date, formatDate).toLocaleDateString(undefined, options);
}

/** Format a time in the browser locale (no seconds by default). */
export function formatTime(time?: PossibleDate, options?: Intl.DateTimeFormatOptions): string {
	return requireDate(time, formatTime).toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		second: undefined, // No seconds by default.
		...options,
	});
}

/** Format a datetime in the browser locale (no seconds by default). */
export function formatDateTime(date: PossibleDate, options?: Intl.DateTimeFormatOptions): string {
	return requireDate(date, formatDateTime).toLocaleString(undefined, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		// No seconds by default.
		...options,
	});
}

/** Format a URL as a user-friendly string, e.g. `http://shax.com/test?uid=129483` → `shax.com/test` */
export function formatURL(possible: PossibleURL, base?: PossibleURL): string {
	const { host, pathname } = requireURL(possible, base, formatURL);
	return `${host}${pathname.length > 1 ? pathname : ""}`;
}

/**
 * Convert any unknown value into a friendly string for user-facing use.
 * - Strings return the string.
 * - Booleans return `"Yes"` or `"No"`
 * - Numbers return formatted number with commas etc (e.g. `formatNumber()`).
 * - Dates return formatted datetime (e.g. `formatDateTime()`).
 * - Arrays return the array items converted to string (with `toTitle()`), and joined with a comma.
 * - Objects return...
 *   1. `object.name` if it exists, or
 *   2. `object.title` if it exists.
 * - Falsy values like `null` and `undefined` return `"None"`
 * - Everything else returns `"Unknown"`
 */
export function formatValue(value: unknown): string {
	if (value === null || value === undefined) return "None";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (typeof value === "string") return value || "None";
	if (typeof value === "number") return formatNumber(value);
	if (typeof value === "symbol") return value.description || "Symbol";
	if (typeof value === "function") return "Function";
	if (isDate(value)) return formatDateTime(value);
	if (isArray(value)) return formatArray(value);
	if (isObject(value)) return formatObject(value);
	return "Unknown";
}
