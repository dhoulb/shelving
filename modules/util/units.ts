import { formatNumber } from "./number";

/**
 * Valid distance unit names.
 * - Correspond to units allowed in `Intl.NumberFormat`
 */
export type Unit = "millimeter" | "centimeter" | "meter" | "kilometer" | "mile" | "yard" | "foot" | "inch";

/** Conversion table for distance unit. */
const unitsData: {
	readonly [K in Unit]: {
		// Meters are required (all conversions go through meters if a specific number isn't provided).
		readonly meter: number;
		// All other units are optional.
		readonly millimeter?: number;
		readonly centimeter?: number;
		readonly kilometer?: number;
		readonly mile?: number;
		readonly yard?: number;
		readonly foot?: number;
		readonly inch?: number;
		readonly regex: RegExp;
		// Short suffix.
		readonly short: string;
		// Default number of decimal places.
		readonly precision?: number;
		// If e.g. `10m` is specified, does `m` mean `mile` or `meter`.
		readonly m?: Unit;
	};
} = {
	millimeter: {
		meter: 0.001,
		regex: /(\d|\b)(millimeters?|millimetres?|mms?)\b/i,
		short: "mm",
	},
	centimeter: {
		meter: 0.01,
		regex: /(\d|\b)(centimeters?|centimetres?|cms?)\b/i,
		short: "cm",
	},
	meter: {
		meter: 1,
		centimeter: 100,
		millimeter: 1000,
		regex: /(\d|\b)(metres?|meters?|m)\b/i,
		short: "m",
	},
	kilometer: {
		meter: 1000,
		centimeter: 100000,
		millimeter: 1000000,
		regex: /(\d|\b)(kilometres?|kilometers?|kms?|k)\b/i,
		short: "km",
		precision: 2,
		m: "mile", // e.g. `10m` means miles.
	},
	mile: {
		meter: 1609.344,
		yard: 1760,
		foot: 5280,
		inch: 63360,
		regex: /(\d|\b)(miles?|mi|m)\b/i,
		short: "mi",
		precision: 2,
		m: "mile", // e.g. `10m` means miles.
	},
	yard: {
		meter: 0.9144,
		inch: 36,
		foot: 3,
		regex: /(\d|\b)(yards?|yds?|y)\b/i,
		short: "yd",
	},
	foot: {
		meter: 0.3048,
		inch: 12,
		regex: /(\d|\b)(feets?|foots?|fts?|f)\b/i,
		short: "ft",
	},
	inch: {
		meter: 0.0254,
		regex: /(\d|\b)(inches|inch|in)\b/i,
		short: "in",
	},
};

/** Convert between two distance units. */
export const convertUnits = (num: number, from: Unit, to: Unit): number => {
	if (from === to) return num;
	const d = unitsData[from];
	const t = d[to];
	if (t) return num * t;
	return (num * d.meter) / unitsData[to].meter;
};

/** Detect which type of distance unit has been typed, e.g. mile or kilometer. */
export const detectUnit = (str: string, defaultUnit: Unit): Unit | false => {
	if (str.match(/^[0-9.,\s]+$/)) return defaultUnit; // Purely numeric number uses default unit.
	if (str.match(unitsData.kilometer.regex)) return "kilometer";
	if (str.match(unitsData.centimeter.regex)) return "centimeter";
	if (str.match(/(\d|\b)m\b/i)) return unitsData[defaultUnit].m || "meter"; // e.g. `10m` could mean meter or mile.
	if (str.match(unitsData.meter.regex)) return "meter";
	if (str.match(unitsData.mile.regex)) return "mile";
	if (str.match(unitsData.yard.regex)) return "yard";
	if (str.match(unitsData.foot.regex)) return "foot";
	if (str.match(unitsData.inch.regex)) return "inch";
	return false; // Cannot figure out unit.
};

/** Format a distance. */
export const formatUnit = (num: number, unit: Unit = "meter", precision = unitsData[unit].precision || 0): string =>
	`${formatNumber(num, precision)} ${unitsData[unit].short}`;
