import { type ImmutableArray, isArray } from "./array.js";
import { SECOND } from "./constants.js";
import { isDate, type PossibleDate, requireDate } from "./date.js";
import { type Duration, getBestTimeUnit, getMilliseconds } from "./duration.js";
import { getPercent } from "./number.js";
import { type ImmutableObject, isObject } from "./object.js";
import { TIME_UNITS, type TimeUnitKey } from "./units.js";
import { type PossibleURL, requireURL } from "./url.js";

/** Options we use for number formatting. */
export type NumberOptions = Omit<
	Intl.NumberFormatOptions,
	"style" | "unit" | "unitDisplay" | "currency" | "currencyDisplay" | "currencySign"
>;

/** Format a number (based on the user's browser language settings). */
export function formatNumber(num: number, options?: NumberOptions): string {
	return Intl.NumberFormat(undefined, options).format(num);
}

/** Format a number range (based on the user's browser language settings). */
export function formatRange(from: number, to: number, options?: NumberOptions): string {
	return Intl.NumberFormat(undefined, options).formatRange(from, to);
}

/** Options for quantity formatting. */
export interface QuantityOptions
	extends Omit<Intl.NumberFormatOptions, "style" | "unit" | "currency" | "currencyDisplay" | "currencySign"> {
	/**
	 * String for one of this thing, e.g. `product` or `item` or `sheep`
	 * - Used for `unitDisplay: "long"` formatting.
	 * - Defaults to unit reference, e.g. "minute"
	 */
	readonly one?: string;
	/**
	 * String for several of this thing, e.g. `products` or `items` or `sheep`
	 * - Used for `unitDisplay: "long"` formatting.
	 * - Defaults to `one + "s"`
	 */
	readonly many?: string;
	/**
	 * Abbreviation for this thing, e.g. `products` or `items` or `sheep` (defaults to `one` + "s").
	 * - Used for `unitDisplay: "narrow"` formatting.
	 * - Defaults to unit reference, e.g. "minute"
	 */
	readonly abbr?: string;
}

/**
 * Format a quantity of a given unit.
 *
 * - Javascript has built-in support for formatting a number of different units.
 * - Unfortunately the list of supported units changes in different browsers.
 * - Ideally we want to format units using the built-in formatting so things like translation and internationalisation are covered.
 * - But we want provide fallback formatting for unsupported units, and do something _good enough_ job in most cases.
 */
export function formatUnit(num: number, unit: string, options?: QuantityOptions): string {
	// Check if the unit is supported by the browser.
	if (Intl.supportedValuesOf("unit").includes(unit)) return Intl.NumberFormat(undefined, { ...options, style: "unit", unit }).format(num);

	// Otherwise, use the default number format.
	const str = Intl.NumberFormat(undefined, { ...options, style: "decimal" }).format(num);
	const { unitDisplay, abbr = unit, one = unit, many = `${one}s` } = options ?? {};
	if (unitDisplay === "long") return `${str} ${str === "1" ? one : many}`;
	return `${str}${unitDisplay === "narrow" ? "" : " "}${abbr}`; // "short" is the default.
}

/** Options we use for currency formatting. */
export type CurrencyOptions = Omit<Intl.NumberFormatOptions, "style" | "unit" | "unitDisplay" | "currency">;

/**
 * Format a currency amount (based on the user's browser language settings).
 */
export function formatCurrency(amount: number, currency: string, options?: CurrencyOptions): string {
	return Intl.NumberFormat(undefined, {
		style: "currency",
		currency,
		...options,
	}).format(amount);
}

/** Options we use for percent formatting. */
export type PercentOptions = Omit<
	Intl.NumberFormatOptions,
	"style" | "unit" | "unitDisplay" | "currency" | "currencyDisplay" | "currencySign"
>;

/**
 * Format a percentage (combines `getPercent()` and `formatQuantity()` for convenience).
 * - Defaults to showing no decimal places.
 * - Defaults to rounding closer to zero (so that 99.99% is shown as 99%).
 * - Javascript's built-in percent formatting works on the `0` zero to `1` range. This uses `getPercent()` which works on `0` to `100` for convenience.
 *
 * @param numerator Number representing the amount of progress (e.g. `50`).
 * @param denumerator The number representing the whole amount (defaults to 100).
 */
export function formatPercent(numerator: number, denumerator?: number, options?: PercentOptions): string {
	return Intl.NumberFormat(undefined, {
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

/**
 * Compact best-fit when a date happens/happened, e.g. `in 10d` or `2h ago` or `in 1w` or `just now`
 * - See `getBestTimeUnit()` for details on how the best-fit unit is chosen.
 * - But: anything under 30 seconds will show `just now`, which makes more sense in most UIs.
 */
export function formatWhen(target: PossibleDate, current?: PossibleDate, options?: Intl.NumberFormatOptions): string {
	const ms = getMilliseconds(current, target, formatWhen);
	const abs = Math.abs(ms);
	if (abs < 30 * SECOND) return "just now";
	const unit = getBestTimeUnit(ms);
	return ms > 0 ? `in ${unit.format(unit.from(abs), options)}` : `${unit.format(unit.from(abs), options)} ago`;
}

/** Compact when a date happens, e.g. `10d` or `2h` or `-1w` */
export function formatUntil(target: PossibleDate, current?: PossibleDate, options?: Intl.NumberFormatOptions): string {
	const ms = getMilliseconds(current, target, formatUntil);
	const unit = getBestTimeUnit(ms);
	return unit.format(unit.from(ms), options);
}

/** Compact when a date will happen, e.g. `10d` or `2h` or `-1w` */
export function formatAgo(target: PossibleDate, current?: PossibleDate, options?: Intl.NumberFormatOptions): string {
	const ms = getMilliseconds(target, current, formatAgo);
	const unit = getBestTimeUnit(ms);
	return unit.format(unit.from(ms), options);
}

/**
 * This roughly corresponds to `Intl.DurationFormatOptions`
 * @todo Use `Intl.DurationFormatOptions` instead it's available in TS lib.
 */
interface DurationFormatOptions {
	style?: "short" | "long" | "narrow";
}

/**
 * Format a duration as a string, e.g. `1 year, 2 months, 3 days` or `1y 2m 3d`
 * @todo Use `Intl.DurationFormat().format()` instead it's more widely supported and is available in TS lib.
 */
export function formatDuration(duration: Duration, options?: DurationFormatOptions): string {
	// Map `DurationFormatOptions` to `NumberFormatOptions`
	const style = options?.style ?? "short";
	return new Intl.ListFormat(undefined, { style, type: "unit" }).format(
		_getDurationStrings(duration, { ...options, style: "unit", unitDisplay: style }),
	);
}
export function* _getDurationStrings(duration: Duration, options?: Intl.NumberFormatOptions): Iterable<string> {
	for (const key of TIME_KEYS) {
		const value = duration[`${key}s`];
		if (typeof value === "number" && value !== 0) yield TIME_UNITS.require(key)?.format(value, options);
	}
}
// Keys we loop through in the right order.
const TIME_KEYS: ImmutableArray<TimeUnitKey> = ["year", "month", "week", "day", "hour", "minute", "second", "millisecond"];
