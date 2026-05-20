import { type ImmutableArray, isArray } from "./array.js";
import { requireCurrencyCode } from "./currency.js";
import { isDate, type PossibleDate, requireDate } from "./date.js";
import type { AnyCaller } from "./function.js";
import { getPercent } from "./number.js";
import { type ImmutableObject, isObject } from "./object.js";
import { isURI, type PossibleURI, requireURI } from "./uri.js";
import { type PossibleURL, requireURL } from "./url.js";

/** Options that are shared across all formatters. */
export interface FormatOptions {
	/** Override the locale for formatting (defaults to detected locale). */
	readonly locale?: Intl.Locale | undefined;
}

/** Format a boolean as "Yes" or "No". */
export function formatBoolean(value: boolean): string {
	return value ? "Yes" : "No";
}

/** Options we use for number formatting. */
export interface NumberFormatOptions
	extends FormatOptions,
		Omit<Intl.NumberFormatOptions, "style" | "unit" | "unitDisplay" | "currency" | "currencyDisplay" | "currencySign"> {}

/** Format a number (based on the user's browser language settings). */
export function formatNumber(num: number, options?: NumberFormatOptions): string {
	return Intl.NumberFormat(options?.locale, options).format(num);
}

/** Format a number range (based on the user's browser language settings). */
export function formatRange(from: number, to: number, options?: NumberFormatOptions): string {
	return Intl.NumberFormat(options?.locale, options).formatRange(from, to);
}

/** Options for quantity formatting. */
export interface UnitFormatOptions
	extends FormatOptions,
		Omit<Intl.NumberFormatOptions, "style" | "unit" | "currency" | "currencyDisplay" | "currencySign"> {
	/**
	 * String for one of this thing, e.g. `product` or `item` or `sheep`
	 * - Used for `unitDisplay: "long"` formatting.
	 * - Defaults to unit reference, e.g. "minute"
	 */
	readonly one?: string | undefined;
	/**
	 * String for several of this thing, e.g. `products` or `items` or `sheep`
	 * - Used for `unitDisplay: "long"` formatting.
	 * - Defaults to `one + "s"`
	 */
	readonly many?: string | undefined;
	/**
	 * Abbreviation for this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s").
	 * - Used for `unitDisplay: "narrow"` formatting.
	 * - Defaults to unit reference, e.g. "minute"
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

/** Options we use for currency formatting. */
export interface CurrencyFormatOptions
	extends FormatOptions,
		Omit<Intl.NumberFormatOptions, "style" | "unit" | "unitDisplay" | "currency"> {}

/** Format a currency amount (based on the user's browser language settings). */
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

/** Options we use for percent formatting. */
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

export interface ArrayFormatOptions extends FormatOptions, Intl.ListFormatOptions {}

/** Format an unknown array as a string. */
export function formatArray(arr: ImmutableArray<unknown>, options?: ArrayFormatOptions, caller: AnyCaller = formatArray): string {
	return new Intl.ListFormat(undefined, { style: "long", type: "unit", ...options }).format(formatValues(arr, options, caller));
}

/** Options we use for currency formatting. */
export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
	/** Override the locale for formatting (defaults to detected locale). */
	readonly locale?: Intl.Locale | undefined;
}

/** Format a date in the browser locale. */
export function formatDate(date: PossibleDate, options?: DateFormatOptions, caller: AnyCaller = formatDate): string {
	return requireDate(date, caller).toLocaleDateString(options?.locale, options);
}

/** Format a time in the browser locale (no seconds by default). */
export function formatTime(time?: PossibleDate, options?: DateFormatOptions, caller: AnyCaller = formatTime): string {
	return requireDate(time, caller).toLocaleTimeString(options?.locale, {
		hour: "2-digit",
		minute: "2-digit",
		second: undefined, // No seconds by default.
		...options,
	});
}

/** Format a datetime in the browser locale (no seconds by default). */
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
 * Format a URI as a user-friendly string
 * e.g. `mailto:dave@shax.com` → `dave@shax.com`
 * e.g. `http://shax.com/test?uid=129483` → `shax.com/test`
 */
export function formatURI(url: PossibleURI, caller: AnyCaller = formatURI): string {
	return _formatURI(requireURI(url, caller));
}
function _formatURI({ host, pathname }: URL): string {
	return `${host}${pathname.endsWith("/") ? pathname.slice(0, -1) : pathname}`;
}

/**
 * Format a URI as a string.
 * e.g. `http://shax.com/test?uid=129483` → `shax.com/test`
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

/** Format a sequence of values. */
export function* formatValues(values: Iterable<unknown>, options?: FormatOptions, caller: AnyCaller = formatValues): Iterable<string> {
	for (const v of values) yield formatValue(v, options, caller);
}
