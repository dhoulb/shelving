import { AssertionError } from "../error/index.js";
import { formatFullQuantity, formatQuantity, MILLION } from "./number.js";
import { NNBSP } from "./string.js";

/** One second in millseconds. */
export const SECOND = 1000;

/** One minute in millseconds. */
export const MINUTE = 60 * SECOND;

/** One hour in millseconds. */
export const HOUR = 60 * MINUTE;

/** One day in millseconds. */
export const DAY = 24 * HOUR;

/** One week in millseconds. */
export const WEEK = 7 * DAY;

/** One month in millseconds. */
export const MONTH = 30 * DAY;

/** One year in millseconds. */
export const YEAR = 365 * DAY;

/** Valid information about a unit of measure. */
export type UnitData = {
	/** Type of a unit. */
	readonly type: UnitType;
	/** Singular name for a unit, e.g. `foot` (only needed if different from reference). */
	readonly singular?: string;
	/** Plural name for a unit, e.g. `feet` */
	readonly plural?: string;
	/** Short suffix for this unit, e.g. `km` */
	readonly suffix: string;
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
	| "ppm"
	| "percentage-point"
	| "basis-point"
	| "degree"
	// | "celsius" // Skipped because conversion requires multiple steps.
	// | "fahrenheit" // Skipped because conversion requires multiple steps.
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
	| "month" // Skipped because conversion is imprecise.
	| "year"; // Skipped because conversion is imprecise.

/** List of units. */
export const UNITS: { [K in UnitReference]: UnitData } = {
	"percent": { type: "percentage", base: 1, suffix: "%" }, // Base for percentage.
	"permille": { type: "percentage", base: 10, suffix: `${NNBSP}‰` },
	"permyriad": { type: "percentage", base: 100, suffix: `${NNBSP}‱` },
	"ppm": { type: "percentage", base: MILLION, suffix: `${NNBSP}ppm`, singular: "part per million", plural: "parts per million" },
	"percentage-point": { type: "percentage", base: 1, suffix: `${NNBSP}pp`, singular: "percentage point", plural: "percentage points" },
	"basis-point": { type: "percentage", base: 10_000, suffix: `${NNBSP}bp`, singular: "basis point", plural: "basis points" },
	"degree": { type: "angle", base: 1, suffix: `${NNBSP}deg` },
	"millimeter": { type: "length", base: 1, suffix: `${NNBSP}mm` },
	"centimeter": { type: "length", base: 10, suffix: `${NNBSP}cm` },
	"meter": { type: "length", base: 1000, centimeter: 100, millimeter: 1000, suffix: `${NNBSP}m` }, // Base for length.
	"kilometer": { type: "length", base: 1_000_000, centimeter: 100_000, millimeter: 1_000_000, suffix: `${NNBSP}km` },
	"inch": { type: "length", base: 25.4, suffix: `${NNBSP}in` },
	"foot": { type: "length", base: 304.8, inch: 12, suffix: `${NNBSP}ft`, plural: "feet" },
	"yard": { type: "length", base: 914.4, inch: 36, foot: 3, suffix: `${NNBSP}yd` },
	"mile": { type: "length", base: 1609344, yard: 1760, foot: 5280, inch: 63360, suffix: `${NNBSP}mi` },
	"milliliter": { type: "volume", base: 1, suffix: `${NNBSP}ml` }, // Base for volume.
	"liter": { type: "volume", base: 1000, suffix: `${NNBSP}l` },
	"fluid-ounce": { type: "volume", base: 29.5735295625, gallon: 128, suffix: `${NNBSP}fl${NNBSP}oz`, singular: "fluid ounce", plural: "fluid ounces" },
	"gallon": { type: "volume", base: 3785.411784, suffix: `${NNBSP}gal` },
	"milligram": { type: "mass", base: 1, suffix: `${NNBSP}mg` }, // Base for mass.
	"gram": { type: "mass", base: 1000, suffix: `${NNBSP}g` },
	"kilogram": { type: "mass", base: 1000000, suffix: `${NNBSP}kg` },
	"ounce": { type: "mass", base: 28349.523125, pound: 0.0625, suffix: `${NNBSP}oz` },
	"pound": { type: "mass", base: 453592.37, ounce: 16, suffix: `${NNBSP}lb` },
	"stone": { type: "mass", base: 6350293.18, pound: 14, ounce: 224, suffix: `${NNBSP}st`, plural: "stone" },
	"millisecond": { type: "time", base: 1, suffix: `${NNBSP}ms` }, // Base for time.
	"second": { type: "time", base: SECOND, suffix: `${NNBSP}s` },
	"minute": { type: "time", base: MINUTE, suffix: `${NNBSP}m` },
	"hour": { type: "time", base: HOUR, suffix: `${NNBSP}h` },
	"day": { type: "time", base: DAY, suffix: `${NNBSP}d` },
	"week": { type: "time", base: WEEK, suffix: `${NNBSP}w` },
	"month": { type: "time", base: MONTH, suffix: `${NNBSP}m` },
	"year": { type: "time", base: YEAR, suffix: `${NNBSP}y` },
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

/**
 * Format a number with a given unit of measure, e.g. `12 kg` or `29.5 l`
 *
 * @param num The number to format.
 * @param unit String reference for a unit of measure e.g. `kilometer`
 * @param maxPrecision Number of decimal places to round the number to e.g. `2`
 */
export const formatUnits = (num: number, unit: UnitReference, maxPrecision?: number, minPrecision?: number): string => formatQuantity(num, UNITS[unit].suffix, maxPrecision, minPrecision);

/**
 * Format a number with a given unit of measure, e.g. `12 kilograms` or `29.5 liters` or `1 degree`
 *
 * @param num The number to format.
 * @param unit String reference for a unit of measure e.g. `kilometer`
 * @param maxPrecision Number of decimal places to round the number to e.g. `2`
 */
export const formatFullUnits = (num: number, unit: UnitReference, maxPrecision?: number, minPrecision?: number): string => formatFullQuantity(num, UNITS[unit].singular || unit, UNITS[unit].plural || `${unit}s`, maxPrecision, minPrecision);
