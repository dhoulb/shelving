import { AssertionError } from "../error/AssertionError.js";
import { DAY, HOUR, HUNDRED_THOUSAND, MILLION, MINUTE, MONTH, SECOND, WEEK, YEAR } from "./constants.js";
import { getDuration, PossibleDate } from "./date.js";
import { formatFullQuantity, formatQuantity, getPercent } from "./number.js";

/** Valid information about a unit of measure. */
export type UnitData = {
	/** Type of a unit. */
	readonly type: UnitType;
	/** Singular name for a unit, e.g. `foot` (only needed if different from reference). */
	readonly singular: string;
	/** Plural name for a unit, e.g. `feet` */
	readonly plural: string;
	/** Abbreviation for this unit, e.g. `km` */
	readonly abbr: string;
	/** All units must specify their 'base' unit, e.g. `meter` for for distance units and `liter` for volume units. */
	readonly base: number;
} & {
	/** All other units are optional. */
	[K in UnitReference]?: number;
};

/** Valid system of measurement reference. */
export type UnitType = "percentage" | "angle" | "temperature" | "length" | "speed" | "pace" | "mass" | "time" | "volume";

/** Valid unit of measurement reference (correspond to units allowed in `Intl.NumberFormat`, but not all). */
export type UnitReference =
	| "percent"
	| "permille"
	| "permyriad"
	| "part-per-million"
	| "percentage-point"
	| "basis-point"
	| "degree"
	// | "celsius" // Skipped because conversion requires multiple steps.
	// | "fahrenheit" // Skipped because conversion requires multiple steps.
	// | "kelvin" // Skipped because conversion requires multiple steps.
	| "millimeter"
	| "centimeter"
	| "meter"
	| "kilometer"
	| "mile"
	| "yard"
	| "foot"
	| "inch"
	| "liter"
	| "milliliter"
	| "gallon"
	| "fluid-ounce"
	| "milligram"
	| "gram"
	| "kilogram"
	| "pound"
	| "stone"
	| "ounce"
	| "millisecond"
	| "second"
	| "minute"
	| "day"
	| "hour"
	| "week"
	| "month"
	| "year"
	| "meter-per-second"
	| "mile-per-hour"
	| "kilometer-per-hour";

/** List of units. */
export const UNITS: { readonly [K in UnitReference]: UnitData } = {
	"percent": { type: "percentage", singular: "percent", plural: "percent", abbr: "%", base: 1 }, // Base for percentage.
	"permille": { type: "percentage", singular: "permille", plural: "permille", abbr: "‰", base: 10 },
	"permyriad": { type: "percentage", singular: "permyriad", plural: "permyriad", abbr: "‱", base: 100 },
	"part-per-million": { type: "percentage", base: MILLION, abbr: "ppm", singular: "part per million", plural: "parts per million" },
	"percentage-point": { type: "percentage", base: 1, abbr: "pp", singular: "percentage point", plural: "percentage points" },
	"basis-point": { type: "percentage", base: 100, abbr: "bp", singular: "basis point", plural: "basis points" },
	"degree": { type: "angle", singular: "degree", plural: "degrees", base: 1, abbr: "deg" },
	"millimeter": { type: "length", singular: "millimeter", plural: "millimeters", base: 1, abbr: "mm" }, // Base for length.
	"centimeter": { type: "length", singular: "centimeter", plural: "centimeters", base: 10, abbr: "cm" },
	"meter": { type: "length", singular: "meter", plural: "meters", abbr: "m", base: 1000, centimeter: 100, millimeter: 1000 },
	"kilometer": { type: "length", singular: "kilometer", plural: "kilometers", abbr: "km", base: MILLION, centimeter: HUNDRED_THOUSAND, millimeter: MILLION },
	"inch": { type: "length", singular: "inch", plural: "inchs", abbr: "in", base: 25.4 },
	"foot": { type: "length", singular: "foot", plural: "feed", abbr: "ft", base: 304.8, inch: 12 },
	"yard": { type: "length", singular: "yard", plural: "yards", abbr: "yd", base: 914.4, inch: 36, foot: 3 },
	"mile": { type: "length", singular: "mile", plural: "miles", base: 1609344, yard: 1760, foot: 5280, inch: 63360, abbr: "mi" },
	"milliliter": { type: "volume", singular: "milliliter", plural: "milliliters", base: 1, abbr: "ml" }, // Base for volume.
	"liter": { type: "volume", singular: "liter", plural: "liters", abbr: "l", base: 1000 },
	"fluid-ounce": { type: "volume", base: 29.5735295625, gallon: 128, abbr: `fl{NNBSP}oz`, singular: "fluid ounce", plural: "fluid ounces" },
	"gallon": { type: "volume", singular: "gallon", plural: "gallons", abbr: "gal", base: 3785.411784 },
	"milligram": { type: "mass", singular: "milligram", plural: "milligrams", abbr: "mg", base: 1 }, // Base for mass.
	"gram": { type: "mass", singular: "gram", plural: "grams", abbr: "g", base: 1000 },
	"kilogram": { type: "mass", singular: "kilogram", plural: "kilograms", abbr: "kg", base: 1000000 },
	"ounce": { type: "mass", singular: "ounce", plural: "ounces", abbr: "oz", base: 28349.523125, pound: 0.0625 },
	"pound": { type: "mass", singular: "pound", plural: "pounds", abbr: "lb", base: 453592.37, ounce: 16 },
	"stone": { type: "mass", singular: "stone", plural: "stone", abbr: "st", base: 6350293.18, pound: 14, ounce: 224 },
	"millisecond": { type: "time", singular: "millisecond", plural: "milliseconds", abbr: "ms", base: 1 }, // Base for time.
	"second": { type: "time", singular: "second", plural: "seconds", abbr: "s", base: SECOND },
	"minute": { type: "time", singular: "minute", plural: "minutes", abbr: "m", base: MINUTE },
	"hour": { type: "time", singular: "hour", plural: "hours", abbr: "h", base: HOUR },
	"day": { type: "time", singular: "day", plural: "days", abbr: "d", base: DAY },
	"week": { type: "time", singular: "week", plural: "weeks", abbr: "w", base: WEEK },
	"month": { type: "time", singular: "month", plural: "months", abbr: "m", base: MONTH },
	"year": { type: "time", singular: "year", plural: "years", abbr: "y", base: YEAR },
	"meter-per-second": { type: "speed", base: 1, singular: "meter per second", plural: "meters per second", abbr: "m/s" }, // Base for speed.
	"mile-per-hour": { type: "speed", base: 0.44702727, singular: "mile per hour", plural: "miles per hour", abbr: "mph" },
	"kilometer-per-hour": { type: "speed", base: 0.27777778, singular: "kilometer per hour", plural: "kilometers per hour", abbr: "kph" },
};

/** Convert between two units of the same type. */
export function convertUnits(num: number, from: UnitReference, to: UnitReference): number {
	if (from === to) return num;
	const fromData = UNITS[from];
	const exact = fromData[to]; // Get the exact conversion if possible (e.g. 5280 feet in a mile).
	if (typeof exact === "number") return num * exact;
	const toData = UNITS[to];
	if (fromData.type !== toData.type) throw new AssertionError(`Target unit must be ${fromData.type}`, toData.type);
	return (num * fromData.base) / toData.base;
}

/** Format a number with a given unit of measure, e.g. `12 kg` or `29.5 l` */
export const formatUnits = (num: number, unit: UnitReference, maxPrecision?: number, minPrecision?: number): string => formatQuantity(num, UNITS[unit].abbr, maxPrecision, minPrecision);

/** Format a number with a given unit of measure, e.g. `12 kilograms` or `29.5 liters` or `1 degree` */
export const formatFullUnits = (num: number, unit: UnitReference, maxPrecision?: number, minPrecision?: number): string => formatFullQuantity(num, UNITS[unit].singular, UNITS[unit].plural, maxPrecision, minPrecision);

/** Format a percentage (combines `getPercent()` and `formatUnits()` for convenience). */
export const formatPercent = (numerator: number, denumerator: number, maxPrecision?: number, minPrecision?: number): string => formatQuantity(getPercent(numerator, denumerator), "%", maxPrecision, minPrecision);

/** Format a duration with a formatter. */
function _formatDuration(formatter: (amount: number, unit: UnitReference, max?: number, min?: number) => string, ms: number, maxPrecision = 0, minPrecision?: number): string {
	const abs = Math.abs(ms);
	if (abs <= 99 * SECOND) return formatter(ms, "second", maxPrecision, minPrecision); // Up to 99 seconds, e.g. '22 seconds ago'
	if (abs <= HOUR) return formatter(ms / MINUTE, "minute", maxPrecision, minPrecision); // Up to one hour  — show minutes, e.g. '18 minutes ago'
	if (abs <= DAY) return formatter(ms / HOUR, "hour", maxPrecision, minPrecision); // Up to one day — show hours, e.g. '23 hours ago'
	if (abs <= 2 * WEEK) return formatter(ms / DAY, "day", maxPrecision, minPrecision); // Up to 2 weeks — show days, e.g. '13 days ago'
	if (abs <= 10 * WEEK) return formatter(ms / WEEK, "week", maxPrecision, minPrecision); // Up to 2 months — show weeks, e.g. '6 weeks ago'
	if (abs <= 18 * MONTH) return formatter(ms / MONTH, "month", maxPrecision, minPrecision); // Up to 18 months — show months, e.g. '6 months ago'
	return formatter(ms / YEAR, "year", maxPrecision, minPrecision); // Above 18 months — show years, e.g. '2 years ago'
}

/** Format a full format of a duration of time using the most reasonable units e.g. `5 years` or `1 week` or `4 minutes` or `12 milliseconds`. */
export const formatFullDuration = (ms: number, maxPrecision?: number, minPrecision?: number): string => _formatDuration(formatFullUnits, ms, maxPrecision, minPrecision);

/** Format a description of a duration of time using the most reasonable units e.g. `5y` or `4m` or `12ms`. */
export const formatDuration = (ms: number, maxPrecision?: number, minPrecision?: number): string => _formatDuration(formatUnits, ms, maxPrecision, minPrecision);

/** format when a data happens/happened. */
function _formatWhen(formatter: (ms: number, maxPrecision?: number, minPrecision?: number) => string, target: PossibleDate, current?: PossibleDate) {
	const ms = getDuration(target, current);
	const abs = Math.abs(ms);
	const duration = formatter(ms);
	return abs < 10 * SECOND ? "just now" : ms > 0 ? `in ${duration}` : `${duration} ago`;
}

/** Full when a date happens/happened, e.g. `in 10 days` or `2 hours ago` */
export const formatFullWhen = (target: PossibleDate, current?: PossibleDate): string => _formatWhen(formatFullDuration, target, current);

/** Compact when a date happens/happened, e.g. `in 10d` or `2h ago` or `in 1w` */
export const formatWhen = (target: PossibleDate, current?: PossibleDate): string => _formatWhen(formatDuration, target, current);

/** Full when a date happens, e.g. `10 days` or `2 hours` or `-1 week` */
export const formatFullUntil = (target: PossibleDate, current?: PossibleDate): string => formatFullDuration(getDuration(target, current));

/** Compact when a date happens, e.g. `10d` or `2h` or `-1w` */
export const formatUntil = (target: PossibleDate, current?: PossibleDate): string => formatDuration(getDuration(target, current));

/** Full when a date happened, e.g. `10 days` or `2 hours` or `-1 week` */
export const formatFullAgo = (target: PossibleDate, current?: PossibleDate): string => formatFullDuration(getDuration(current, target));

/** Compact when a date will happen, e.g. `10d` or `2h` or `-1w` */
export const formatAgo = (target: PossibleDate, current?: PossibleDate): string => formatDuration(getDuration(current, target));
