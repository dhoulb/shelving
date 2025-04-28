import { describe, expect, test } from "bun:test";
import { ANGLE_UNITS, AREA_UNITS, LENGTH_UNITS, MASS_UNITS, SPEED_UNITS, TEMPERATURE_UNITS, TIME_UNITS, VOLUME_UNITS } from "../index.js";

describe("to()", () => {
	test("to() works correctly with base", () => {
		expect(LENGTH_UNITS.require("millimeter").to(1)).toBe(1);
		expect(LENGTH_UNITS.require("meter").to(1)).toBe(1000);
	});
	test("to() works correctly", () => {
		// Angle.
		expect(ANGLE_UNITS.require("degree").to(123, "degree")).toBe(123);
		expect(ANGLE_UNITS.require("degree").to(180, "gradian")).toBe(200);
		expect(ANGLE_UNITS.require("gradian").to(200, "degree")).toBe(180);
		expect(ANGLE_UNITS.require("degree").to(180, "radian")).toBeCloseTo(Math.PI);
		expect(ANGLE_UNITS.require("radian").to(Math.PI, "degree")).toBeCloseTo(180);

		// Length.
		expect(LENGTH_UNITS.require("meter").to(123, "meter")).toBe(123);
		expect(LENGTH_UNITS.require("millimeter").to(1000, "meter")).toBe(1);
		expect(LENGTH_UNITS.require("meter").to(1, "millimeter")).toBe(1000);
		expect(LENGTH_UNITS.require("meter").to(1, "kilometer")).toBe(0.001);
		expect(LENGTH_UNITS.require("kilometer").to(1, "meter")).toBe(1000);
		expect(LENGTH_UNITS.require("meter").to(1, "foot")).toBeCloseTo(3.28084);
		expect(LENGTH_UNITS.require("foot").to(1, "meter")).toBeCloseTo(0.3048);
		expect(LENGTH_UNITS.require("meter").to(1, "yard")).toBeCloseTo(1.09361);
		expect(LENGTH_UNITS.require("yard").to(1, "meter")).toBeCloseTo(0.9144);
		expect(LENGTH_UNITS.require("yard").to(1, "foot")).toBe(3);
		expect(LENGTH_UNITS.require("foot").to(1, "yard")).toBeCloseTo(0.3333333);
		expect(LENGTH_UNITS.require("inch").to(1, "foot")).toBeCloseTo(0.0833333);
		expect(LENGTH_UNITS.require("foot").to(1, "inch")).toBe(12);
		expect(LENGTH_UNITS.require("inch").to(1, "yard")).toBeCloseTo(0.0277);
		expect(LENGTH_UNITS.require("yard").to(1, "inch")).toBe(36);

		// Time.
		expect(TIME_UNITS.require("millisecond").to(1000, "millisecond")).toBe(1000);
		expect(TIME_UNITS.require("hour").to(1, "millisecond")).toBe(60 * 60 * 1000);
		expect(TIME_UNITS.require("year").to(1, "millisecond")).toBe(365 * 24 * 60 * 60 * 1000);

		// Speed.
		expect(SPEED_UNITS.require("meter-per-second").to(123, "meter-per-second")).toBe(123);
		expect(SPEED_UNITS.require("meter-per-second").to(1000, "mile-per-hour")).toBeCloseTo(2236.94);
		expect(SPEED_UNITS.require("mile-per-hour").to(1000, "meter-per-second")).toBeCloseTo(447.04);
		expect(SPEED_UNITS.require("meter-per-second").to(1000, "kilometer-per-hour")).toBe(3600);
		expect(SPEED_UNITS.require("kilometer-per-hour").to(1000, "meter-per-second")).toBeCloseTo(277.777);
		expect(SPEED_UNITS.require("mile-per-hour").to(1000, "kilometer-per-hour")).toBeCloseTo(1609.34);
		expect(SPEED_UNITS.require("kilometer-per-hour").to(1000, "mile-per-hour")).toBeCloseTo(621.371);

		// Mass.
		expect(MASS_UNITS.require("milligram").to(1000, "milligram")).toBe(1000);
		expect(MASS_UNITS.require("milligram").to(1000000, "kilogram")).toBe(1);
		expect(MASS_UNITS.require("kilogram").to(1, "milligram")).toBe(1000000);

		// Area.
		expect(AREA_UNITS.require("square-millimeter").to(123, "square-millimeter")).toBe(123);
		expect(AREA_UNITS.require("hectare").to(1, "square-meter")).toBe(10000);
		expect(AREA_UNITS.require("square-inch").to(1000, "square-millimeter")).toBe(645160);
		expect(AREA_UNITS.require("square-foot").to(1000, "square-meter")).toBeCloseTo(92.903);
		expect(AREA_UNITS.require("square-foot").to(1, "square-inch")).toBe(12 * 12);
		expect(AREA_UNITS.require("square-yard").to(1000, "square-meter")).toBeCloseTo(836.127);
		expect(AREA_UNITS.require("square-yard").to(1, "square-foot")).toBe(3 * 3);
		expect(AREA_UNITS.require("square-yard").to(1, "square-inch")).toBe(36 * 36);
		expect(AREA_UNITS.require("acre").to(1, "square-meter")).toBeCloseTo(4046.86);

		// Volume.
		expect(VOLUME_UNITS.require("milliliter").to(123, "milliliter")).toBe(123);
		expect(VOLUME_UNITS.require("milliliter").to(1000, "liter")).toBe(1);
		expect(VOLUME_UNITS.require("liter").to(1, "milliliter")).toBe(1000);
		expect(VOLUME_UNITS.require("cubic-centimeter").to(123, "milliliter")).toBe(123);
		expect(VOLUME_UNITS.require("cubic-meter").to(1, "cubic-centimeter")).toBe(100 * 100 * 100);
		expect(VOLUME_UNITS.require("us-fluid-ounce").to(10, "milliliter")).toBeCloseTo(295.735);
		expect(VOLUME_UNITS.require("us-pint").to(1, "milliliter")).toBeCloseTo(473.176);
		expect(VOLUME_UNITS.require("us-pint").to(1, "us-fluid-ounce")).toBe(16);
		expect(VOLUME_UNITS.require("us-gallon").to(2, "liter")).toBeCloseTo(7.571);
		expect(VOLUME_UNITS.require("us-gallon").to(1, "us-pint")).toBe(8);
		expect(VOLUME_UNITS.require("us-gallon").to(1, "us-fluid-ounce")).toBe(128);
		expect(VOLUME_UNITS.require("imperial-fluid-ounce").to(12, "milliliter")).toBeCloseTo(340.957);
		expect(VOLUME_UNITS.require("imperial-pint").to(1, "milliliter")).toBeCloseTo(568.261);
		expect(VOLUME_UNITS.require("imperial-pint").to(1, "imperial-fluid-ounce")).toBe(20);
		expect(VOLUME_UNITS.require("imperial-gallon").to(1, "milliliter")).toBeCloseTo(4546.09);
		expect(VOLUME_UNITS.require("imperial-gallon").to(1, "imperial-pint")).toBe(8);
		expect(VOLUME_UNITS.require("imperial-gallon").to(1, "imperial-fluid-ounce")).toBe(160);
		expect(VOLUME_UNITS.require("cubic-inch").to(1000, "liter")).toBeCloseTo(16.3871);
		expect(VOLUME_UNITS.require("cubic-foot").to(1, "liter")).toBeCloseTo(28.3168);
		expect(VOLUME_UNITS.require("cubic-yard").to(1, "liter")).toBeCloseTo(764.555);

		// Temperature.
		expect(TEMPERATURE_UNITS.require("celsius").to(100, "celsius")).toBe(100);
		expect(TEMPERATURE_UNITS.require("celsius").to(50, "kelvin")).toBeCloseTo(323.15);
		expect(TEMPERATURE_UNITS.require("kelvin").to(50, "celsius")).toBeCloseTo(-223.15);
		expect(TEMPERATURE_UNITS.require("celsius").to(28, "fahrenheit")).toBeCloseTo(82.4);
		expect(TEMPERATURE_UNITS.require("fahrenheit").to(70, "celsius")).toBeCloseTo(21.1111);
		expect(TEMPERATURE_UNITS.require("celsius").to(-40, "fahrenheit")).toBe(-40);
		expect(TEMPERATURE_UNITS.require("fahrenheit").to(-40, "celsius")).toBe(-40);
	});
});
describe("format()", () => {
	test("format() short units that work with Intl.NumberFormat", () => {
		expect(LENGTH_UNITS.require("meter").format(123)).toBe("123 m");
		expect(LENGTH_UNITS.require("centimeter").format(1234)).toBe("1,234 cm");
		expect(LENGTH_UNITS.require("foot").format(123)).toBe("123 ft");
		expect(LENGTH_UNITS.require("yard").format(1234)).toBe("1,234 yd");

		// Precision.
		expect(LENGTH_UNITS.require("kilometer").format(1.1111, { maximumFractionDigits: 0, minimumFractionDigits: 0 })).toBe("1 km");
		expect(LENGTH_UNITS.require("kilometer").format(1.1111, { maximumFractionDigits: 2, minimumFractionDigits: 2 })).toBe("1.11 km");
		expect(LENGTH_UNITS.require("kilometer").format(1.1111, { maximumFractionDigits: 4, minimumFractionDigits: 4 })).toBe("1.1111 km");
		expect(LENGTH_UNITS.require("kilometer").format(1.1111, { maximumFractionDigits: 6, minimumFractionDigits: 6 })).toBe("1.111100 km");
	});
	test("format() long units that work with Intl.NumberFormat", () => {
		expect(LENGTH_UNITS.require("meter").format(0, { unitDisplay: "long" })).toBe("0 meters");
		expect(LENGTH_UNITS.require("meter").format(1, { unitDisplay: "long" })).toBe("1 meter");
		expect(LENGTH_UNITS.require("meter").format(2, { unitDisplay: "long" })).toBe("2 meters");
		expect(LENGTH_UNITS.require("meter").format(123, { unitDisplay: "long" })).toBe("123 meters");
		expect(LENGTH_UNITS.require("meter").format(1234, { unitDisplay: "long" })).toBe("1,234 meters");
		expect(LENGTH_UNITS.require("foot").format(1, { unitDisplay: "long" })).toBe("1 foot");
		expect(LENGTH_UNITS.require("foot").format(123, { unitDisplay: "long" })).toBe("123 feet");
		expect(LENGTH_UNITS.require("foot").format(1234, { unitDisplay: "long" })).toBe("1,234 feet");
		expect(LENGTH_UNITS.require("yard").format(1, { unitDisplay: "long" })).toBe("1 yard");
		expect(LENGTH_UNITS.require("yard").format(123, { unitDisplay: "long" })).toBe("123 yards");
		expect(LENGTH_UNITS.require("yard").format(1234, { unitDisplay: "long" })).toBe("1,234 yards");

		// Precision.
		expect(
			LENGTH_UNITS.require("kilometer").format(1.1111, { maximumFractionDigits: 0, minimumFractionDigits: 0, unitDisplay: "long" }),
		).toBe("1 kilometer");
		expect(
			LENGTH_UNITS.require("kilometer").format(1.1111, { maximumFractionDigits: 2, minimumFractionDigits: 2, unitDisplay: "long" }),
		).toBe("1.11 kilometers");
		expect(
			LENGTH_UNITS.require("kilometer").format(1.1111, { maximumFractionDigits: 4, minimumFractionDigits: 4, unitDisplay: "long" }),
		).toBe("1.1111 kilometers");
		expect(
			LENGTH_UNITS.require("kilometer").format(1.1111, { maximumFractionDigits: 6, minimumFractionDigits: 6, unitDisplay: "long" }),
		).toBe("1.111100 kilometers");
	});
	test("format() short units that are polyfilled", () => {
		expect(ANGLE_UNITS.require("radian").format(123)).toBe("123 rad");

		// Precision.
		expect(ANGLE_UNITS.require("radian").format(1.1111, { maximumFractionDigits: 0, minimumFractionDigits: 0 })).toBe("1 rad");
		expect(ANGLE_UNITS.require("radian").format(1.1111, { maximumFractionDigits: 2, minimumFractionDigits: 2 })).toBe("1.11 rad");
	});
	test("format() long units that work with Intl.NumberFormat", () => {
		expect(ANGLE_UNITS.require("radian").format(0, { unitDisplay: "long" })).toBe("0 radians");
		expect(ANGLE_UNITS.require("radian").format(1, { unitDisplay: "long" })).toBe("1 radian");
		expect(ANGLE_UNITS.require("radian").format(2, { unitDisplay: "long" })).toBe("2 radians");

		// Precision.
		expect(ANGLE_UNITS.require("radian").format(1.1111, { maximumFractionDigits: 0, minimumFractionDigits: 0, unitDisplay: "long" })).toBe(
			"1 radians",
		);
		expect(ANGLE_UNITS.require("radian").format(1.1111, { maximumFractionDigits: 2, minimumFractionDigits: 2, unitDisplay: "long" })).toBe(
			"1.11 radians",
		);
	});
});
