import { AssertionError } from "../error/index.js";
import { DAY, HOUR, MINUTE, MONTH, SECOND, WEEK, YEAR } from "./date.js";
import { formatFullQuantity, formatQuantity } from "./number.js";
import { NNBSP } from "./string.js";

/** Valid information about a unit of measure. */
export type UnitData = {
	/** Plural name for a unit, e.g. `feet` */
	readonly plural?: string;
	/** Type of a unit. */
	readonly type: UnitType;
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
	"percent": { type: "percentage", base: 1, suffix: "%" },
	"degree": { type: "angle", base: 1, suffix: "deg" },
	"millimeter": { type: "length", base: 0.001, suffix: "mm" },
	"centimeter": { type: "length", base: 0.01, suffix: "cm" },
	"meter": { type: "length", base: 1, centimeter: 100, millimeter: 1000, suffix: "m" }, // Base for length.
	"kilometer": { type: "length", base: 1000, centimeter: 100000, millimeter: 1000000, suffix: "km" },
	"inch": { type: "length", base: 0.0254, suffix: "in" },
	"foot": { type: "length", base: 0.3048, inch: 12, suffix: "ft", plural: "feet" },
	"yard": { type: "length", base: 0.9144, inch: 36, foot: 3, suffix: "yd" },
	"mile": { type: "length", base: 1609.344, yard: 1760, foot: 5280, inch: 63360, suffix: "mi" },
	"milliliter": { type: "volume", base: 1, suffix: "ml" }, // Base for volume.
	"liter": { type: "volume", base: 1000, suffix: "l" },
	"fluid-ounce": { type: "volume", base: 29.5735295625, gallon: 128, suffix: `fl${NNBSP}oz` },
	"gallon": { type: "volume", base: 3785.411784, suffix: "gal" },
	"milligram": { type: "mass", base: 0.001, suffix: "mg" },
	"gram": { type: "mass", base: 1, suffix: "g" }, // Base for mass.
	"kilogram": { type: "mass", base: 1000, suffix: "kg" },
	"ounce": { type: "mass", base: 28.349523125, pound: 0.0625, suffix: "oz" },
	"pound": { type: "mass", base: 453.59237, ounce: 16, suffix: "lb" },
	"stone": { type: "mass", base: 6350.29318, pound: 14, ounce: 224, suffix: "st", plural: "stone" },
	"millisecond": { type: "time", base: 1, suffix: "ms" }, // Base for time.
	"second": { type: "time", base: SECOND, suffix: "s" },
	"minute": { type: "time", base: MINUTE, suffix: "m" },
	"hour": { type: "time", base: HOUR, suffix: "h" },
	"day": { type: "time", base: DAY, suffix: "d" },
	"week": { type: "time", base: WEEK, suffix: "w" },
	"month": { type: "time", base: MONTH, suffix: "m" },
	"year": { type: "time", base: YEAR, suffix: "y" },
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
export const formatFullUnits = (num: number, unit: UnitReference, maxPrecision?: number, minPrecision?: number): string => formatFullQuantity(num, unit, UNITS[unit].plural || `${unit}s`, maxPrecision, minPrecision);
