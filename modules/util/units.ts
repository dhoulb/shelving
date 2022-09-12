import { ConditionError } from "../error/ConditionError.js";
import { DAY, HOUR, MILLION, MINUTE, MONTH, NNBSP, SECOND, WEEK, YEAR } from "./constants.js";
import { getDuration, PossibleDate } from "./date.js";
import { MapKey, RequiredMap } from "./map.js";
import { formatFullQuantity, formatQuantity, getPercent } from "./number.js";
import { getProps } from "./object.js";

/** Conversion from one unit to another (either a number to multiple by, or a function to convert). */
type Conversion = number | ((num: number) => number);

/** Set of possible conversions for a set of items. */
type Conversions<T extends string> = { readonly [K in T]?: Conversion };

/** Convert an amount using a `Conversion. */
const _convert = (amount: number, conversion: Conversion): number => (typeof conversion === "function" ? conversion(amount) : conversion === 1 ? amount : amount * conversion);

// Params for a unit.
type UnitProps<T extends string> = {
	/** Short abbreviation for this unit, e.g. `km` (defaults to first letter of `ref`). */
	readonly abbr?: string;
	/** Singular name for this unit, e.g. `kilometer` (defaults to `ref` + "s"). */
	readonly singular?: string;
	/** Plural name for this unit, e.g. `kilometers` (defaults to `ref`). */
	readonly plural?: string;
	/** Conversions to other units (typically needs at least the base conversion, unless it's already the base unit). */
	readonly to?: Conversions<T>;
};

/** Represent a unit. */
export class Unit<T extends string> {
	private readonly _to: Conversions<T> | undefined;

	/** Reference for this unit, e.g. `kilometer` */
	readonly ref: T;
	/** Short abbreviation for this unit, e.g. `km` (defaults to first letter of `ref`). */
	readonly abbr: string;
	/** Singular name for this unit, e.g. `kilometer` (defaults to `ref`). */
	readonly singular: string;
	/** Plural name for this unit, e.g. `kilometers` (defaults to `singular` + "s"). */
	readonly plural: string;

	constructor(
		/** `UnitList` this unit belongs to. */
		public readonly list: UnitList<T>,
		/** Reference for this unit. */
		ref: T,
		/** Props to configure this unit. */
		{ abbr = ref.slice(0, 1), singular = ref.replace(/-/, " "), plural = `${singular}s`, to }: UnitProps<T>,
	) {
		this.ref = ref;
		this.abbr = abbr;
		this.singular = singular;
		this.plural = plural;
		this._to = to;
	}

	/** Convert an amount from this unit to another unit. */
	to(amount: number, ref: T | Unit<T> = this.list.base): number {
		return this._toUnit(amount, this._unit(ref));
	}

	/** Convert an amount from another unit to this unit. */
	from(amount: number, ref: T | Unit<T> = this.list.base): number {
		return this._unit(ref)._toUnit(amount, this);
	}

	/** Get a unit from a unit or unit reference. */
	private _unit(ref: T | Unit<T>): Unit<T> {
		return typeof ref === "string" ? this.list.get(ref) : ref;
	}

	/** Convert an amount from this unit to another unit (must specify another `Unit` instance). */
	private _toUnit(amount: number, unit: Unit<T>): number {
		// Convert to self.
		if (unit === this) return amount;
		// Exact conversion.
		const thisToUnit = this._to?.[unit.ref];
		if (thisToUnit) return _convert(amount, thisToUnit);
		// Invert number conversion (can't do this for function conversions).
		const unitToThis = unit._to?.[this.ref];
		if (typeof unitToThis === "number") return amount / unitToThis;
		// Two step conversion via base.
		const base = this.list.base;
		const thisToBase = this._to?.[base.ref];
		if (thisToBase) return base._toUnit(_convert(amount, thisToBase), unit);
		// Cannot convert.
		throw new ConditionError(`Cannot convert "${this.ref}" to "${unit.ref}"`);
	}

	/** Format a number with a given unit of measure, e.g. `12 kg` or `29.5 l` */
	format(amount: number, maxPrecision?: number, minPrecision?: number): string {
		return formatQuantity(amount, this.abbr, maxPrecision, minPrecision);
	}

	/** Format a number with a given unit of measure, e.g. `12 kilograms` or `29.5 liters` or `1 degree` */
	formatFull(amount: number, maxPrecision?: number, minPrecision?: number): string {
		return formatFullQuantity(amount, this.singular, this.plural, maxPrecision, minPrecision);
	}
}

/** Represent a list of units. */
export class UnitList<T extends string> extends RequiredMap<T, Unit<T>> {
	public readonly base!: Unit<T>;
	constructor(units: { [K in T]: UnitProps<T> }) {
		super();
		for (const [ref, props] of getProps(units)) {
			const unit = new Unit<T>(this, ref, props);
			if (!this.base) this.base = unit;
			super.set(ref, unit);
		}
	}
}
export interface UnitList<T extends string> {
	(units: { [K in T]: UnitProps<T> }): UnitList<T>;
	set: never; // Disallow `map.set()`
	delete: never; // Disallow `map.delete()`
}

// Distance constants.
const IN_PER_FT = 12;
const IN_PER_YD = 36;
const IN_PER_MI = 63360;
const FT_PER_YD = 3;
const FT_PER_MI = 5280;
const YD_PER_MI = 1760;
const YD_PER_FUR = 220;
const MM_PER_CM = 10;
const MM_PER_M = 1000;
const MM_PER_KM = MILLION;
const MM_PER_IN = 25.4;
const MM_PER_MI = 1609344;

// Mass constants.
const MG_PER_LB = 453592.37;
const OZ_PER_LB = 16;
const LB_PER_ST = 14;

// Area constants.
const MM2_PER_IN2 = MM_PER_IN ** 2;
const FT2_PER_ACRE = 66 * 660;
const YD2_PER_ACRE = 22 * 220;

// Volume constants.
const MM3_PER_IN3 = MM_PER_IN ** 3;
const ML_PER_IN3 = MM3_PER_IN3 / 1000;
const US_IN3_PER_GAL = 231;
const IMP_ML_PER_GAL = 4546090 / 1000;

/** Percentage units. */
export const PERCENTAGE_UNITS = new UnitList({
	percent: { abbr: "%", plural: "percent" },
});
export type PercentageUnit = MapKey<typeof PERCENTAGE_UNITS>;

/** Point units. */
export const POINT_UNITS = new UnitList({
	"basis-point": { abbr: "bp" },
	"percentage-point": { abbr: "pp", to: { "basis-point": 100 } },
});
export type PointUnit = MapKey<typeof POINT_UNITS>;

/** Angle units. */
export const ANGLE_UNITS = new UnitList({
	degree: { abbr: "deg" },
	radian: { abbr: "rad", to: { degree: 180 / Math.PI } },
	gradian: { abbr: "grad", to: { degree: 180 / 200 } },
});
export type AngleUnit = MapKey<typeof ANGLE_UNITS>;

/** Mass units. */
export const MASS_UNITS = new UnitList({
	// Metric.
	milligram: { abbr: "mg" },
	gram: { abbr: "g", to: { milligram: 1000 } },
	kilogram: { abbr: "kg", to: { milligram: MILLION } },
	// Imperial.
	ounce: { abbr: "oz", to: { milligram: MG_PER_LB / OZ_PER_LB } },
	pound: { abbr: "lb", to: { milligram: MG_PER_LB, ounce: OZ_PER_LB } },
	stone: { abbr: "st", plural: "stone", to: { milligram: MG_PER_LB * LB_PER_ST, pound: LB_PER_ST, ounce: OZ_PER_LB * LB_PER_ST } },
});
export type MassUnit = MapKey<typeof MASS_UNITS>;

/** Time units. */
export const TIME_UNITS = new UnitList({
	// Metric.
	millisecond: { abbr: "ms" },
	second: { to: { millisecond: SECOND } },
	minute: { to: { millisecond: MINUTE } },
	hour: { to: { millisecond: HOUR } },
	day: { to: { millisecond: DAY } },
	week: { to: { millisecond: WEEK } },
	month: { to: { millisecond: MONTH } },
	year: { to: { millisecond: YEAR } },
});
export type TimeUnit = MapKey<typeof TIME_UNITS>;

/** Length units. */
export const LENGTH_UNITS = new UnitList({
	// Metric.
	millimeter: { abbr: "mm" },
	centimeter: { abbr: "cm", to: { millimeter: MM_PER_CM } },
	meter: { to: { millimeter: MM_PER_M } },
	kilometer: { abbr: "km", to: { millimeter: MM_PER_KM } },
	// Imperial.
	inch: { abbr: "in", plural: "inches", to: { millimeter: MM_PER_IN } },
	foot: { abbr: "ft", plural: "feet", to: { millimeter: IN_PER_FT * MM_PER_IN, inch: IN_PER_FT } },
	yard: { abbr: "yd", to: { millimeter: IN_PER_YD * MM_PER_IN, inch: IN_PER_YD, foot: FT_PER_YD } },
	furlong: { abbr: "fur", to: { millimeter: IN_PER_YD * MM_PER_IN * YD_PER_FUR, foot: YD_PER_FUR * FT_PER_YD, yard: YD_PER_FUR } },
	mile: { abbr: "mi", to: { millimeter: MM_PER_MI, yard: YD_PER_MI, foot: FT_PER_MI, inch: IN_PER_MI } },
});
export type LengthUnit = MapKey<typeof LENGTH_UNITS>;

/** Speed units. */
export const SPEED_UNITS = new UnitList({
	// Metric.
	"meter-per-second": { abbr: "m/s", singular: "meter per second", plural: "meters per second", to: { "kilometer-per-hour": 3.6 } },
	"kilometer-per-hour": { abbr: "kph", singular: "kilometer per hour", plural: "kilometers per hour", to: { "meter-per-second": MM_PER_KM / HOUR } },
	// Imperial.
	"mile-per-hour": { abbr: "mph", singular: "mile per hour", plural: "miles per hour", to: { "meter-per-second": MM_PER_MI / HOUR } },
});
export type SpeedUnit = MapKey<typeof SPEED_UNITS>;

/** Area units. */
export const AREA_UNITS = new UnitList({
	// Metric.
	"square-millimeter": { abbr: "mm²" },
	"square-centimeter": { abbr: "cm²", to: { "square-millimeter": MM_PER_CM ** 2 } },
	"square-meter": { abbr: "m²", to: { "square-millimeter": MM_PER_M ** 2 } },
	"square-kilometer": { abbr: "km²", to: { "square-millimeter": MM_PER_KM ** 2 } },
	"hectare": { abbr: "ha", to: { "square-millimeter": (MM_PER_M * 100) ** 2 } },
	// Imperial.
	"square-inch": { abbr: `in²`, plural: "square inches", to: { "square-millimeter": MM2_PER_IN2 } },
	"square-foot": { abbr: `ft²`, plural: "square feet", to: { "square-millimeter": IN_PER_FT ** 2 * MM2_PER_IN2, "square-inch": IN_PER_FT ** 2 } },
	"square-yard": { abbr: `yd²`, to: { "square-millimeter": IN_PER_YD ** 2 * MM2_PER_IN2, "square-foot": FT_PER_YD ** 2, "square-inch": IN_PER_YD ** 2 } },
	"acre": { abbr: "acre", to: { "square-millimeter": IN_PER_YD ** 2 * YD2_PER_ACRE * MM2_PER_IN2, "square-foot": FT2_PER_ACRE, "square-yard": YD2_PER_ACRE } },
});

/** Volume units. */
export const VOLUME_UNITS = new UnitList({
	// Metric.
	"milliliter": { abbr: "ml" },
	"liter": { to: { milliliter: 1000 } },
	"cubic-centimeter": { abbr: "cm³", to: { milliliter: 1 } },
	"cubic-meter": { abbr: "m³", to: { milliliter: MILLION } },
	// US.
	"us-fluid-ounce": { abbr: `fl${NNBSP}oz`, singular: "US fluid ounce", plural: "US fluid ounces", to: { milliliter: (US_IN3_PER_GAL * ML_PER_IN3) / 128 } },
	"us-pint": { abbr: "pt", singular: "US pint", to: { "milliliter": (US_IN3_PER_GAL * ML_PER_IN3) / 8, "us-fluid-ounce": 16 } },
	"us-quart": { abbr: "qt", singular: "US quart", to: { "milliliter": (US_IN3_PER_GAL * ML_PER_IN3) / 4, "us-pint": 2, "us-fluid-ounce": 32 } },
	"us-gallon": { abbr: "gal", singular: "US gallon", to: { "milliliter": US_IN3_PER_GAL * ML_PER_IN3, "us-quart": 4, "us-pint": 8, "us-fluid-ounce": 128 } },
	// Imperial.
	"imperial-fluid-ounce": { abbr: `fl${NNBSP}oz`, to: { milliliter: IMP_ML_PER_GAL / 160 } },
	"imperial-pint": { abbr: `pt`, to: { "milliliter": IMP_ML_PER_GAL / 8, "imperial-fluid-ounce": 20 } },
	"imperial-quart": { abbr: "qt", to: { "milliliter": IMP_ML_PER_GAL / 4, "imperial-pint": 2, "imperial-fluid-ounce": 40 } },
	"imperial-gallon": { abbr: "gal", to: { "milliliter": IMP_ML_PER_GAL, "imperial-quart": 4, "imperial-pint": 8, "imperial-fluid-ounce": 160 } },
	"cubic-inch": { abbr: "in³", plural: "cubic inches", to: { milliliter: ML_PER_IN3 } },
	"cubic-foot": { abbr: "ft³", plural: "cubic feet", to: { "milliliter": IN_PER_FT ** 3 * ML_PER_IN3, "cubic-inch": IN_PER_FT ** 3 } },
	"cubic-yard": { abbr: "yd³", to: { "milliliter": IN_PER_YD ** 3 * ML_PER_IN3, "cubic-foot": FT_PER_YD ** 3, "cubic-inch": IN_PER_YD ** 3 } },
});
export type VolumeUnit = MapKey<typeof VOLUME_UNITS>;

/** Temperature units. */
export const TEMPERATURE_UNITS = new UnitList({
	celsius: { abbr: "°C", singular: "degree Celsius", plural: "degrees Celsius", to: { fahrenheit: n => n * (9 / 5) + 32, kelvin: n => n + 273.15 } },
	fahrenheit: { abbr: "°F", singular: "degree Fahrenheit", plural: "degrees Fahrenheit", to: { celsius: n => (n - 32) * (5 / 9) } },
	kelvin: { abbr: "°K", singular: "degree Kelvin", plural: "degrees Kelvin", to: { celsius: n => n - 273.15 } },
});
export type TemperatureUnit = MapKey<typeof TEMPERATURE_UNITS>;

/** Format a percentage (combines `getPercent()` and `formatUnits()` for convenience). */
export const formatPercent = (numerator: number, denumerator: number, maxPrecision?: number, minPrecision?: number): string => formatQuantity(getPercent(numerator, denumerator), "%", maxPrecision, minPrecision);

/** Format a duration with a formatter. */
function _getTimeUnitReference(ms: number): TimeUnit {
	const abs = Math.abs(ms);
	if (abs > 18 * MONTH) return "year";
	if (abs > 10 * WEEK) return "month";
	if (abs > 2 * WEEK) return "week";
	if (abs > DAY) return "day";
	if (abs > HOUR) return "hour";
	if (abs > 9949) return "minute";
	if (abs > SECOND) return "second";
	return "millisecond";
}

/** Format a full format of a duration of time using the most reasonable units e.g. `5 years` or `1 week` or `4 minutes` or `12 milliseconds`. */
export function formatFullDuration(ms: number, maxPrecision?: number, minPrecision?: number): string {
	const unit = TIME_UNITS.get(_getTimeUnitReference(ms));
	return unit.formatFull(unit.from(ms), maxPrecision, minPrecision);
}

/** Format a description of a duration of time using the most reasonable units e.g. `5y` or `4m` or `12ms`. */
export function formatDuration(ms: number, maxPrecision?: number, minPrecision?: number): string {
	const unit = TIME_UNITS.get(_getTimeUnitReference(ms));
	return unit.format(unit.from(ms), maxPrecision, minPrecision);
}

/** format when a data happens/happened. */
function _formatWhen(formatter: typeof formatFullDuration | typeof formatDuration, target: PossibleDate, current?: PossibleDate) {
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
