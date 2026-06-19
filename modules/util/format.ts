import { type ImmutableArray, isArray } from "./array.js";
import { requireCurrencyCode } from "./currency.js";
import { isDate, type PossibleDate, requireDate } from "./date.js";
import type { AnyCaller } from "./function.js";
import { getPercent } from "./number.js";
import { type ImmutableObject, isObject } from "./object.js";
import { isURI, type PossibleURI, requireURI } from "./uri.js";
import { type PossibleURL, requireURL } from "./url.js";

/**
 * Options that are shared across all formatters.
 *
 * @see https://dhoulb.github.io/shelving/util/format/FormatOptions
 */
export interface FormatOptions {
	/**
	 * Override the locale for formatting (defaults to detected locale).
	 *
	 * @see https://dhoulb.github.io/shelving/util/format/FormatOptions/locale
	 */
	readonly locale?: Intl.Locale | undefined;
}

/**
 * Format a boolean as `"Yes"` or `"No"`.
 *
 * @param value Boolean value to format.
 * @returns `"Yes"` if `value` is `true`, otherwise `"No"`.
 * @example formatBoolean(true) // "Yes"
 * @see https://dhoulb.github.io/shelving/util/format/formatBoolean
 */
export function formatBoolean(value: boolean): string {
	return value ? "Yes" : "No";
}

/**
 * Options we use for number formatting.
 *
 * @see https://dhoulb.github.io/shelving/util/format/NumberFormatOptions
 */
export interface NumberFormatOptions
	extends FormatOptions,
		Omit<Intl.NumberFormatOptions, "style" | "unit" | "unitDisplay" | "currency" | "currencyDisplay" | "currencySign"> {}

/**
 * Format a number (based on the user's browser language settings).
 *
 * @param num Number to format.
 * @param options Formatting options passed through to `Intl.NumberFormat`.
 * @returns Locale-formatted number string.
 * @example formatNumber(1234.5) // "1,234.5"
 * @see https://dhoulb.github.io/shelving/util/format/formatNumber
 */
export function formatNumber(num: number, options?: NumberFormatOptions): string {
	return Intl.NumberFormat(options?.locale, options).format(num);
}

/**
 * Format a number range (based on the user's browser language settings).
 *
 * @param from Number at the start of the range.
 * @param to Number at the end of the range.
 * @param options Formatting options passed through to `Intl.NumberFormat`.
 * @returns Locale-formatted number range string.
 * @example formatRange(1, 10) // "1–10"
 * @see https://dhoulb.github.io/shelving/util/format/formatRange
 */
export function formatRange(from: number, to: number, options?: NumberFormatOptions): string {
	return Intl.NumberFormat(options?.locale, options).formatRange(from, to);
}

/**
 * Options for quantity formatting.
 *
 * @see https://dhoulb.github.io/shelving/util/format/UnitFormatOptions
 */
export interface UnitFormatOptions
	extends FormatOptions,
		Omit<Intl.NumberFormatOptions, "style" | "unit" | "currency" | "currencyDisplay" | "currencySign"> {
	/**
	 * String for one of this thing, e.g. `product` or `item` or `sheep`
	 * - Used for `unitDisplay: "long"` formatting.
	 * - Defaults to unit reference, e.g. "minute"
	 *
	 * @see https://dhoulb.github.io/shelving/util/format/UnitFormatOptions/one
	 */
	readonly one?: string | undefined;
	/**
	 * String for several of this thing, e.g. `products` or `items` or `sheep`
	 * - Used for `unitDisplay: "long"` formatting.
	 * - Defaults to `one + "s"`
	 *
	 * @see https://dhoulb.github.io/shelving/util/format/UnitFormatOptions/many
	 */
	readonly many?: string | undefined;
	/**
	 * Abbreviation for this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s").
	 * - Used for `unitDisplay: "narrow"` formatting.
	 * - Defaults to unit reference, e.g. "minute"
	 *
	 * @see https://dhoulb.github.io/shelving/util/format/UnitFormatOptions/abbr
	 */
	readonly abbr?: string | undefined;
}

/**
 * Format a quantity of a given unit.
 *
 * - Javascript has built-in support for formatting a number of different units.
 * - Unfortunately the list of supported units changes in different browsers.
 * - Ideally we want to format units using the built-in formatting so things like translation and internationalisation are covered.
 * - But we want provide fallback formatting for unsupported units, and do something _good enough_ job in most cases.
 *
 * @param num Quantity to format.
 * @param unit Unit reference to format the quantity as, e.g. `"minute"` or `"product"`.
 * @param options Formatting options including custom `one`/`many`/`abbr` strings for unsupported units.
 * @returns Formatted quantity string, e.g. `"5 minutes"` or `"5 products"`.
 * @example formatUnit(5, "minute", { unitDisplay: "long" }) // "5 minutes"
 * @see https://dhoulb.github.io/shelving/util/format/formatUnit
 */
export function formatUnit(num: number, unit: string, options?: UnitFormatOptions): string {
	// Check if the unit is supported by the browser.
	if (Intl.supportedValuesOf("unit").includes(unit))
		return Intl.NumberFormat(options?.locale, { ...options, style: "unit", unit }).format(num);

	// Otherwise, use the default number format.
	const str = Intl.NumberFormat(options?.locale, { ...options, style: "decimal" }).format(num);
	const { unitDisplay, abbr = unit, one = unit, many = `${one}s` } = options ?? {};
	if (unitDisplay === "long") return `${str} ${str === "1" ? one : many}`;
	return `${str}${unitDisplay === "narrow" ? "" : " "}${abbr}`; // "short" is the default.
}

/**
 * Options we use for currency formatting.
 *
 * @see https://dhoulb.github.io/shelving/util/format/CurrencyFormatOptions
 */
export interface CurrencyFormatOptions
	extends FormatOptions,
		Omit<Intl.NumberFormatOptions, "style" | "unit" | "unitDisplay" | "currency"> {}

/**
 * Format a currency amount (based on the user's browser language settings).
 *
 * @param amount Amount of money to format.
 * @param currency ISO 4217 currency code, e.g. `"USD"` or `"GBP"`.
 * @param options Formatting options passed through to `Intl.NumberFormat`.
 * @param caller Function to attribute a thrown error to (defaults to `formatCurrency` itself).
 * @returns Locale-formatted currency string.
 * @throws {RequiredError} If `currency` is not a valid currency code.
 * @example formatCurrency(1234.5, "USD") // "$1,234.50"
 * @see https://dhoulb.github.io/shelving/util/format/formatCurrency
 */
export function formatCurrency(
	amount: number,
	currency: string,
	options?: CurrencyFormatOptions,
	caller: AnyCaller = formatCurrency,
): string {
	return Intl.NumberFormat(options?.locale, {
		style: "currency",
		...options,
		currency: requireCurrencyCode(currency, caller),
	}).format(amount);
}

/**
 * Options we use for percent formatting.
 *
 * @see https://dhoulb.github.io/shelving/util/format/PercentFormatOptions
 */
export interface PercentFormatOptions
	extends FormatOptions,
		Omit<Intl.NumberFormatOptions, "style" | "unit" | "unitDisplay" | "currency" | "currencyDisplay" | "currencySign"> {}

/**
 * Format a percentage (combines `getPercent()` and `formatUnit()` for convenience).
 * - Defaults to showing no decimal places.
 * - Defaults to rounding closer to zero (so that 99.99% is shown as 99%).
 * - Javascript's built-in percent formatting works on the `0` zero to `1` range. This uses `getPercent()` which works on `0` to `100` for convenience.
 *
 * @param numerator Number representing the amount of progress (e.g. `50`).
 * @param denumerator The number representing the whole amount (defaults to 100).
 * @param options Formatting options passed through to `Intl.NumberFormat`.
 * @returns Locale-formatted percentage string.
 * @example formatPercent(50) // "50%"
 * @see https://dhoulb.github.io/shelving/util/format/formatPercent
 */
export function formatPercent(numerator: number, denumerator?: number, options?: PercentFormatOptions): string {
	return Intl.NumberFormat(options?.locale, {
		style: "percent",
		maximumFractionDigits: 0,
		roundingMode: "floor",
		...options,
	}).format(getPercent(numerator, denumerator) / 100);
}

/**
 * Format an unknown object as a string.
 * - Use the custom `.toString()` function if it exists (don't use built in `Object.prototype.toString` because it's useless.
 * - Use `.title` or `.name` or `.id` if they exist and are strings.
 * - Use `Object` otherwise.
 *
 * @param obj Object to format.
 * @returns Best-available string representation of `obj`, or `"Object"` as a fallback.
 * @example formatObject({ name: "Dave" }) // "Dave"
 * @see https://dhoulb.github.io/shelving/util/format/formatObject
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

/**
 * Options for formatting an array as a string with `formatArray()`.
 *
 * @see https://dhoulb.github.io/shelving/util/format/ArrayFormatOptions
 */
export interface ArrayFormatOptions extends FormatOptions, Intl.ListFormatOptions {}

/**
 * Format an unknown array as a string.
 *
 * @param arr Array of values to format.
 * @param options Formatting options passed through to `Intl.ListFormat`.
 * @param caller Function to attribute a thrown error to (defaults to `formatArray` itself).
 * @returns Locale-formatted list string with each item converted via `formatValue()`.
 * @example formatArray(["a", "b", "c"]) // "a, b, and c"
 * @see https://dhoulb.github.io/shelving/util/format/formatArray
 */
export function formatArray(arr: ImmutableArray<unknown>, options?: ArrayFormatOptions, caller: AnyCaller = formatArray): string {
	return new Intl.ListFormat(undefined, { style: "long", type: "unit", ...options }).format(formatValues(arr, options, caller));
}

/**
 * Options we use for date, time, and datetime formatting.
 *
 * @see https://dhoulb.github.io/shelving/util/format/DateFormatOptions
 */
export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
	/**
	 * Override the locale for formatting (defaults to detected locale).
	 *
	 * @see https://dhoulb.github.io/shelving/util/format/DateFormatOptions/locale
	 */
	readonly locale?: Intl.Locale | undefined;
}

/**
 * Format a date in the browser locale.
 *
 * @param date Date to format.
 * @param options Formatting options passed through to `Date.toLocaleDateString`.
 * @param caller Function to attribute a thrown error to (defaults to `formatDate` itself).
 * @returns Locale-formatted date string.
 * @throws {RequiredError} If `date` cannot be converted to a valid date.
 * @example formatDate("2025-01-01") // "1/1/2025"
 * @see https://dhoulb.github.io/shelving/util/format/formatDate
 */
export function formatDate(date: PossibleDate, options?: DateFormatOptions, caller: AnyCaller = formatDate): string {
	return requireDate(date, caller).toLocaleDateString(options?.locale, options);
}

/**
 * Format a time in the browser locale (no seconds by default).
 *
 * @param time Time to format (defaults to now).
 * @param options Formatting options passed through to `Date.toLocaleTimeString`.
 * @param caller Function to attribute a thrown error to (defaults to `formatTime` itself).
 * @returns Locale-formatted time string.
 * @throws {RequiredError} If `time` cannot be converted to a valid date.
 * @example formatTime("2025-01-01T13:30") // "01:30 PM"
 * @see https://dhoulb.github.io/shelving/util/format/formatTime
 */
export function formatTime(time?: PossibleDate, options?: DateFormatOptions, caller: AnyCaller = formatTime): string {
	return requireDate(time, caller).toLocaleTimeString(options?.locale, {
		hour: "2-digit",
		minute: "2-digit",
		second: undefined, // No seconds by default.
		...options,
	});
}

/**
 * Format a datetime in the browser locale (no seconds by default).
 *
 * @param date Date to format.
 * @param options Formatting options passed through to `Date.toLocaleString`.
 * @param caller Function to attribute a thrown error to (defaults to `formatDateTime` itself).
 * @returns Locale-formatted datetime string.
 * @throws {RequiredError} If `date` cannot be converted to a valid date.
 * @example formatDateTime("2025-01-01T13:30") // "1/1/2025, 01:30 PM"
 * @see https://dhoulb.github.io/shelving/util/format/formatDateTime
 */
export function formatDateTime(date: PossibleDate, options?: DateFormatOptions, caller: AnyCaller = formatDateTime): string {
	return requireDate(date, caller).toLocaleString(options?.locale, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		// No seconds by default.
		...options,
	});
}

/**
 * Format a URI as a user-friendly string.
 * - e.g. `mailto:dave@shax.com` → `dave@shax.com`
 * - e.g. `http://shax.com/test?uid=129483` → `shax.com/test`
 *
 * @param url URI to format.
 * @param caller Function to attribute a thrown error to (defaults to `formatURI` itself).
 * @returns Friendly string showing the host and path with any trailing slash removed.
 * @throws {RequiredError} If `url` cannot be converted to a valid URI.
 * @example formatURI("http://shax.com/test?uid=129483") // "shax.com/test"
 * @see https://dhoulb.github.io/shelving/util/format/formatURI
 */
export function formatURI(url: PossibleURI, caller: AnyCaller = formatURI): string {
	return _formatURI(requireURI(url, caller));
}
function _formatURI({ host, pathname }: URL): string {
	return `${host}${pathname.endsWith("/") ? pathname.slice(0, -1) : pathname}`;
}

/**
 * Format a URL as a user-friendly string.
 * - e.g. `http://shax.com/test?uid=129483` → `shax.com/test`
 *
 * @param url URL to format.
 * @param base Base URL to resolve `url` against if it is relative.
 * @param caller Function to attribute a thrown error to (defaults to `formatURL` itself).
 * @returns Friendly string showing the host and path with any trailing slash removed.
 * @throws {RequiredError} If `url` cannot be converted to a valid URL.
 * @example formatURL("http://shax.com/test?uid=129483") // "shax.com/test"
 * @see https://dhoulb.github.io/shelving/util/format/formatURL
 */
export function formatURL(url: PossibleURL, base?: PossibleURL, caller: AnyCaller = formatURL): string {
	return _formatURI(requireURL(url, base, caller));
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
 *
 * @param value Unknown value to format.
 * @param options Formatting options passed through to the underlying formatter.
 * @param caller Function to attribute a thrown error to (defaults to `formatValue` itself).
 * @returns User-facing string representation of `value`.
 * @example formatValue(1234) // "1,234"
 * @see https://dhoulb.github.io/shelving/util/format/formatValue
 */
export function formatValue(value: unknown, options?: FormatOptions, caller: AnyCaller = formatValue): string {
	if (value === null || value === undefined) return "None";
	if (typeof value === "boolean") return formatBoolean(value);
	if (typeof value === "string") return value || "None";
	if (typeof value === "number") return formatNumber(value, options);
	if (typeof value === "symbol") return value.description || "Symbol";
	if (typeof value === "function") return "Function";
	if (isDate(value)) return formatDateTime(value, options, caller);
	if (isArray(value)) return formatArray(value, options, caller);
	if (isObject(value)) return formatObject(value);
	if (isURI(value)) return formatURI(value, caller);
	return "Unknown";
}

/**
 * Format a sequence of values.
 *
 * @param values Iterable of unknown values to format.
 * @param options Formatting options passed through to `formatValue()` for each item.
 * @param caller Function to attribute a thrown error to (defaults to `formatValues` itself).
 * @returns Iterable yielding the user-facing string for each value.
 * @example [...formatValues([1234, true])] // ["1,234", "Yes"]
 * @see https://dhoulb.github.io/shelving/util/format/formatValues
 */
export function* formatValues(values: Iterable<unknown>, options?: FormatOptions, caller: AnyCaller = formatValues): Iterable<string> {
	for (const v of values) yield formatValue(v, options, caller);
}
