import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import { DAY, HOUR, MILLION, MINUTE, MONTH, NNBSP, SECOND, WEEK, YEAR } from "./constants.js";
import { formatNumber, formatQuantity, pluralizeQuantity } from "./format.js";
import type { AnyFunction } from "./function.js";
import { ImmutableMap, type MapKey } from "./map.js";
import type { ImmutableObject } from "./object.js";
import { getProps } from "./object.js";

/** Conversion from one unit to another (either an amount to multiple by, or a function to convert). */
type Conversion = number | ((num: number) => number);

/** Set of possible conversions for a set of items. */
type Conversions<T extends string> = { readonly [K in T]?: Conversion };

/** Convert an amount using a `Conversion. */
function _convert(amount: number, conversion: Conversion): number {
	return typeof conversion === "function" ? conversion(amount) : conversion === 1 ? amount : amount * conversion;
}

// Params for a unit.
type UnitProps<T extends string> = {
	/** Short abbreviation for this unit, e.g. `km` (defaults to first letter of `id`). */
	readonly abbr?: string;
	/** Singular name for this unit, e.g. `kilometer` (defaults to `id` + "s"). */
	readonly singular?: string;
	/** Plural name for this unit, e.g. `kilometers` (defaults to `id`). */
	readonly plural?: string;
	/** Conversions to other units (typically needs at least the base conversion, unless it's already the base unit). */
	readonly to?: Conversions<T>;
	/** Possible options for formatting these units with `Intl.NumberFormat` (`.unit` can be specified if different from key, but is not required). */
	readonly options?: Intl.NumberFormatOptions;
};

/** Represent a unit. */
export class Unit<K extends string> {
	private readonly _to: Conversions<K> | undefined;

	/** `UnitList` this unit belongs to. */
	public readonly list: UnitList<K>;
	/** String key for this unit, e.g. `kilometer` */
	public readonly key: K;
	/** Short abbreviation for this unit, e.g. `km` (defaults to first letter of `id`). */
	public readonly abbr: string;
	/** Singular name for this unit, e.g. `kilometer` (defaults to `id`). */
	public readonly singular: string;
	/** Plural name for this unit, e.g. `kilometers` (defaults to `singular` + "s"). */
	public readonly plural: string;
	/** Possible options for formatting these units with `Intl.NumberFormat` (`.unit` can be specified if different from key, but is not required). */
	public readonly options?: Readonly<Intl.NumberFormatOptions>;

	/** Title for this unit (uses format `abbr (plural)`, e.g. `fl oz (US fluid ounces)`) */
	get title(): string {
		return `${this.abbr} (${this.plural})`;
	}

	constructor(
		/** `UnitList` this unit belongs to. */
		list: UnitList<K>,
		/** String key for this unit, e.g. `kilometer` */
		key: K,
		/** Props to configure this unit. */
		{ abbr = key.slice(0, 1), singular = key.replace(/-/, " "), plural = `${singular}s`, to }: UnitProps<K>,
	) {
		this.list = list;
		this.key = key;
		this.abbr = abbr;
		this.singular = singular;
		this.plural = plural;
		this._to = to;
	}

	/** Convert an amount from this unit to another unit. */
	to(amount: number, targetKey?: K): number {
		const target = targetKey ? _requireUnit(this.to, this.list, targetKey) : this.list.base;
		return this._convertTo(amount, target, this.to);
	}

	/** Convert an amount from another unit to this unit. */
	from(amount: number, sourceKey?: K): number {
		const source = sourceKey ? _requireUnit(this.from, this.list, sourceKey) : this.list.base;
		return source._convertTo(amount, this, this.from);
	}

	/** Convert an amount from this unit to another unit (must specify another `Unit` instance). */
	private _convertTo(amount: number, target: Unit<K>, caller: AnyFunction): number {
		// No conversion.
		if (target === this) return amount;

		// Exact conversion.
		// When this unit knows the multiplier or function to convert to the target unit.
		const thisToUnit = this._to?.[target.key];
		if (thisToUnit) return _convert(amount, thisToUnit);

		// Invert number conversion.
		// This is where the target type knows the multiplier to convert to this.
		// Can't do this for function conversions.
		const unitToThis = target._to?.[this.key];
		if (typeof unitToThis === "number") return amount / unitToThis;

		// Via base conversion.
		// Everything should know how to convert to its base units.
		const base = this.list.base;
		const thisToBase = this._to?.[base.key];
		if (thisToBase) return base._convertTo(_convert(amount, thisToBase), target, caller);

		// Not convertable.
		throw new ValueError(`Cannot convert "${base.key}" to "${this.key}"`, { list: this, caller });
	}

	/**
	 * Format an amount with a given unit of measure, e.g. `12 kg` or `29.5 l`
	 * - Uses `Intl.NumberFormat` if this is a supported unit (so e.g. `ounce` is translated to e.g. `Unze` in German).
	 * - Polyfills unsupported units to use long/short form based on `options.unitDisplay`.
	 */
	format(amount: number, options?: Intl.NumberFormatOptions): string {
		// If possible use `Intl` so that the user's locale is used.
		if (Intl.supportedValuesOf("unit").includes(this.key))
			return formatNumber(amount, { style: "unit", unitDisplay: "short", ...this.options, ...options, unit: this.key });

		// Otherwise, use the default number format.
		// If unitDisplay is "long" use the singular/plural form.
		const o: Intl.NumberFormatOptions = { style: "decimal", unitDisplay: "short", ...this.options, ...options };
		return o.unitDisplay === "long" ? pluralizeQuantity(amount, this.singular, this.plural, o) : formatQuantity(amount, this.abbr, o);
	}
}

/**
 * Represent a list of units.
 * - Has a known base unit at `.base`
 * - Can get required units from `.unit()`
 * - Cannot have additional units added after it is created.
 */
export class UnitList<K extends string> extends ImmutableMap<K, Unit<K>> {
	public readonly base!: Unit<K>;
	constructor(units: ImmutableObject<K, UnitProps<K>>) {
		super();
		for (const [id, props] of getProps(units)) {
			const unit = new Unit<K>(this, id, props);
			if (!this.base) this.base = unit;
			Map.prototype.set.call(this, id, unit);
		}
	}

	/** Convert an amount from a unit to another unit. */
	convert(amount: number, sourceKey: K, targetKey: K): number {
		return _requireUnit(this.convert, this, sourceKey).to(amount, targetKey);
	}

	/**
	 * Require a unit from this list.
	 * @throws RequiredError if the unit key is not found.
	 */
	require(key: K): Unit<K> {
		return _requireUnit(this.require, this, key);
	}
}

function _requireUnit<K extends string>(caller: AnyFunction, list: UnitList<K>, key: K): Unit<K> {
	const unit = list.get(key);
	if (!unit) throw new RequiredError(`Unknown unit "${key}"`, { key, list, caller });
	return unit;
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
export const PERCENT_UNITS = new UnitList({
	percent: { abbr: "%", plural: "percent" },
});
export type PercentUnitKey = MapKey<typeof PERCENT_UNITS>;

/** Point units. */
export const POINT_UNITS = new UnitList({
	"basis-point": { abbr: "bp" },
	"percentage-point": { abbr: "pp", to: { "basis-point": 100 } },
});
export type PointUnitKey = MapKey<typeof POINT_UNITS>;

/** Angle units. */
export const ANGLE_UNITS = new UnitList({
	degree: { abbr: "deg" },
	radian: { abbr: "rad", to: { degree: 180 / Math.PI } },
	gradian: { abbr: "grad", to: { degree: 180 / 200 } },
});
export type AngleUnitKey = MapKey<typeof ANGLE_UNITS>;

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
export type MassUnitKey = MapKey<typeof MASS_UNITS>;

const TIME_OPTIONS: Intl.NumberFormatOptions = {
	roundingMode: "trunc",
	maximumFractionDigits: 0,
};

/** Time units. */
export const TIME_UNITS = new UnitList({
	millisecond: { abbr: "ms", options: TIME_OPTIONS },
	second: { to: { millisecond: SECOND }, options: TIME_OPTIONS },
	minute: { to: { millisecond: MINUTE }, options: TIME_OPTIONS },
	hour: { to: { millisecond: HOUR }, options: TIME_OPTIONS },
	day: { to: { millisecond: DAY }, options: TIME_OPTIONS },
	week: { to: { millisecond: WEEK }, options: TIME_OPTIONS },
	month: { to: { millisecond: MONTH }, options: TIME_OPTIONS },
	year: { to: { millisecond: YEAR }, options: TIME_OPTIONS },
});
export type TimeUnitKey = MapKey<typeof TIME_UNITS>;

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
export type LengthUnitKey = MapKey<typeof LENGTH_UNITS>;

/** Speed units. */
export const SPEED_UNITS = new UnitList({
	// Metric.
	"meter-per-second": { abbr: "m/s", singular: "meter per second", plural: "meters per second", to: { "kilometer-per-hour": 3.6 } },
	"kilometer-per-hour": {
		abbr: "kph",
		singular: "kilometer per hour",
		plural: "kilometers per hour",
		to: { "meter-per-second": MM_PER_KM / HOUR },
	},
	// Imperial.
	"mile-per-hour": { abbr: "mph", singular: "mile per hour", plural: "miles per hour", to: { "meter-per-second": MM_PER_MI / HOUR } },
});
export type SpeedUnitKey = MapKey<typeof SPEED_UNITS>;

/** Area units. */
export const AREA_UNITS = new UnitList({
	// Metric.
	"square-millimeter": { abbr: "mm²" },
	"square-centimeter": { abbr: "cm²", to: { "square-millimeter": MM_PER_CM ** 2 } },
	"square-meter": { abbr: "m²", to: { "square-millimeter": MM_PER_M ** 2 } },
	"square-kilometer": { abbr: "km²", to: { "square-millimeter": MM_PER_KM ** 2 } },
	hectare: { abbr: "ha", to: { "square-millimeter": (MM_PER_M * 100) ** 2 } },
	// Imperial.
	"square-inch": { abbr: "in²", plural: "square inches", to: { "square-millimeter": MM2_PER_IN2 } },
	"square-foot": {
		abbr: "ft²",
		plural: "square feet",
		to: { "square-millimeter": IN_PER_FT ** 2 * MM2_PER_IN2, "square-inch": IN_PER_FT ** 2 },
	},
	"square-yard": {
		abbr: "yd²",
		to: { "square-millimeter": IN_PER_YD ** 2 * MM2_PER_IN2, "square-foot": FT_PER_YD ** 2, "square-inch": IN_PER_YD ** 2 },
	},
	acre: {
		abbr: "acre",
		to: { "square-millimeter": IN_PER_YD ** 2 * YD2_PER_ACRE * MM2_PER_IN2, "square-foot": FT2_PER_ACRE, "square-yard": YD2_PER_ACRE },
	},
});
export type AreaUnitKey = MapKey<typeof AREA_UNITS>;

/** Volume units. */
export const VOLUME_UNITS = new UnitList({
	// Metric.
	milliliter: { abbr: "ml" },
	liter: { abbr: "ltr", to: { milliliter: 1000 } },
	"cubic-centimeter": { abbr: "cm³", to: { milliliter: 1 } },
	"cubic-meter": { abbr: "m³", to: { milliliter: MILLION } },
	// US.
	"us-fluid-ounce": {
		abbr: `fl${NNBSP}oz`,
		singular: "US fluid ounce",
		plural: "US fluid ounces",
		to: { milliliter: (US_IN3_PER_GAL * ML_PER_IN3) / 128 },
	},
	"us-pint": { abbr: "pt", singular: "US pint", to: { milliliter: (US_IN3_PER_GAL * ML_PER_IN3) / 8, "us-fluid-ounce": 16 } },
	"us-quart": {
		abbr: "qt",
		singular: "US quart",
		to: { milliliter: (US_IN3_PER_GAL * ML_PER_IN3) / 4, "us-pint": 2, "us-fluid-ounce": 32 },
	},
	"us-gallon": {
		abbr: "gal",
		singular: "US gallon",
		to: { milliliter: US_IN3_PER_GAL * ML_PER_IN3, "us-quart": 4, "us-pint": 8, "us-fluid-ounce": 128 },
	},
	// Imperial.
	"imperial-fluid-ounce": { abbr: `fl${NNBSP}oz`, to: { milliliter: IMP_ML_PER_GAL / 160 } },
	"imperial-pint": { abbr: "pt", to: { milliliter: IMP_ML_PER_GAL / 8, "imperial-fluid-ounce": 20 } },
	"imperial-quart": { abbr: "qt", to: { milliliter: IMP_ML_PER_GAL / 4, "imperial-pint": 2, "imperial-fluid-ounce": 40 } },
	"imperial-gallon": {
		abbr: "gal",
		to: { milliliter: IMP_ML_PER_GAL, "imperial-quart": 4, "imperial-pint": 8, "imperial-fluid-ounce": 160 },
	},
	"cubic-inch": { abbr: "in³", plural: "cubic inches", to: { milliliter: ML_PER_IN3 } },
	"cubic-foot": { abbr: "ft³", plural: "cubic feet", to: { milliliter: IN_PER_FT ** 3 * ML_PER_IN3, "cubic-inch": IN_PER_FT ** 3 } },
	"cubic-yard": {
		abbr: "yd³",
		to: { milliliter: IN_PER_YD ** 3 * ML_PER_IN3, "cubic-foot": FT_PER_YD ** 3, "cubic-inch": IN_PER_YD ** 3 },
	},
});
export type VolumeUnitKey = MapKey<typeof VOLUME_UNITS>;

/** Temperature units. */
export const TEMPERATURE_UNITS = new UnitList({
	celsius: {
		abbr: "°C",
		singular: "degree Celsius",
		plural: "degrees Celsius",
		to: { fahrenheit: n => n * (9 / 5) + 32, kelvin: n => n + 273.15 },
	},
	fahrenheit: { abbr: "°F", singular: "degree Fahrenheit", plural: "degrees Fahrenheit", to: { celsius: n => (n - 32) * (5 / 9) } },
	kelvin: { abbr: "°K", singular: "degree Kelvin", plural: "degrees Kelvin", to: { celsius: n => n - 273.15 } },
});
export type TemperatureUnitKey = MapKey<typeof TEMPERATURE_UNITS>;
