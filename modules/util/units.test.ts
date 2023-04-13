import { ANGLE_UNITS, AREA_UNITS, getMapItem, LENGTH_UNITS, MASS_UNITS, SPEED_UNITS, TEMPERATURE_UNITS, TIME_UNITS, VOLUME_UNITS } from "../index.js";

test("to() works correctly with base", () => {
	expect(getMapItem(LENGTH_UNITS, "millimeter").to(1)).toBe(1);
	expect(getMapItem(LENGTH_UNITS, "meter").to(1)).toBe(1000);
});
test("to() works correctly", () => {
	// Angle.
	expect(getMapItem(ANGLE_UNITS, "degree").to(123, "degree")).toBe(123);
	expect(getMapItem(ANGLE_UNITS, "degree").to(180, "gradian")).toBe(200);
	expect(getMapItem(ANGLE_UNITS, "gradian").to(200, "degree")).toBe(180);
	expect(getMapItem(ANGLE_UNITS, "degree").to(180, "radian")).toBeCloseTo(Math.PI);
	expect(getMapItem(ANGLE_UNITS, "radian").to(Math.PI, "degree")).toBeCloseTo(180);

	// Length.
	expect(getMapItem(LENGTH_UNITS, "meter").to(123, "meter")).toBe(123);
	expect(getMapItem(LENGTH_UNITS, "millimeter").to(1000, "meter")).toBe(1);
	expect(getMapItem(LENGTH_UNITS, "meter").to(1, "millimeter")).toBe(1000);
	expect(getMapItem(LENGTH_UNITS, "meter").to(1, "kilometer")).toBe(0.001);
	expect(getMapItem(LENGTH_UNITS, "kilometer").to(1, "meter")).toBe(1000);
	expect(getMapItem(LENGTH_UNITS, "meter").to(1, "foot")).toBeCloseTo(3.28084);
	expect(getMapItem(LENGTH_UNITS, "foot").to(1, "meter")).toBeCloseTo(0.3048);
	expect(getMapItem(LENGTH_UNITS, "meter").to(1, "yard")).toBeCloseTo(1.09361);
	expect(getMapItem(LENGTH_UNITS, "yard").to(1, "meter")).toBeCloseTo(0.9144);
	expect(getMapItem(LENGTH_UNITS, "yard").to(1, "foot")).toBe(3);
	expect(getMapItem(LENGTH_UNITS, "foot").to(1, "yard")).toBeCloseTo(0.3333333);
	expect(getMapItem(LENGTH_UNITS, "inch").to(1, "foot")).toBeCloseTo(0.0833333);
	expect(getMapItem(LENGTH_UNITS, "foot").to(1, "inch")).toBe(12);
	expect(getMapItem(LENGTH_UNITS, "inch").to(1, "yard")).toBeCloseTo(0.0277);
	expect(getMapItem(LENGTH_UNITS, "yard").to(1, "inch")).toBe(36);

	// Time.
	expect(getMapItem(TIME_UNITS, "millisecond").to(1000, "millisecond")).toBe(1000);
	expect(getMapItem(TIME_UNITS, "hour").to(1, "millisecond")).toBe(60 * 60 * 1000);
	expect(getMapItem(TIME_UNITS, "year").to(1, "millisecond")).toBe(365 * 24 * 60 * 60 * 1000);

	// Speed.
	expect(getMapItem(SPEED_UNITS, "meter-per-second").to(123, "meter-per-second")).toBe(123);
	expect(getMapItem(SPEED_UNITS, "meter-per-second").to(1000, "mile-per-hour")).toBeCloseTo(2236.94);
	expect(getMapItem(SPEED_UNITS, "mile-per-hour").to(1000, "meter-per-second")).toBeCloseTo(447.04);
	expect(getMapItem(SPEED_UNITS, "meter-per-second").to(1000, "kilometer-per-hour")).toBe(3600);
	expect(getMapItem(SPEED_UNITS, "kilometer-per-hour").to(1000, "meter-per-second")).toBeCloseTo(277.777);
	expect(getMapItem(SPEED_UNITS, "mile-per-hour").to(1000, "kilometer-per-hour")).toBeCloseTo(1609.34);
	expect(getMapItem(SPEED_UNITS, "kilometer-per-hour").to(1000, "mile-per-hour")).toBeCloseTo(621.371);

	// Mass.
	expect(getMapItem(MASS_UNITS, "milligram").to(1000, "milligram")).toBe(1000);
	expect(getMapItem(MASS_UNITS, "milligram").to(1000000, "kilogram")).toBe(1);
	expect(getMapItem(MASS_UNITS, "kilogram").to(1, "milligram")).toBe(1000000);

	// Area.
	expect(getMapItem(AREA_UNITS, "square-millimeter").to(123, "square-millimeter")).toBe(123);
	expect(getMapItem(AREA_UNITS, "hectare").to(1, "square-meter")).toBe(10000);
	expect(getMapItem(AREA_UNITS, "square-inch").to(1000, "square-millimeter")).toBe(645160);
	expect(getMapItem(AREA_UNITS, "square-foot").to(1000, "square-meter")).toBeCloseTo(92.903);
	expect(getMapItem(AREA_UNITS, "square-foot").to(1, "square-inch")).toBe(12 * 12);
	expect(getMapItem(AREA_UNITS, "square-yard").to(1000, "square-meter")).toBeCloseTo(836.127);
	expect(getMapItem(AREA_UNITS, "square-yard").to(1, "square-foot")).toBe(3 * 3);
	expect(getMapItem(AREA_UNITS, "square-yard").to(1, "square-inch")).toBe(36 * 36);
	expect(getMapItem(AREA_UNITS, "acre").to(1, "square-meter")).toBeCloseTo(4046.86);

	// Volume.
	expect(getMapItem(VOLUME_UNITS, "milliliter").to(123, "milliliter")).toBe(123);
	expect(getMapItem(VOLUME_UNITS, "milliliter").to(1000, "liter")).toBe(1);
	expect(getMapItem(VOLUME_UNITS, "liter").to(1, "milliliter")).toBe(1000);
	expect(getMapItem(VOLUME_UNITS, "cubic-centimeter").to(123, "milliliter")).toBe(123);
	expect(getMapItem(VOLUME_UNITS, "cubic-meter").to(1, "cubic-centimeter")).toBe(100 * 100 * 100);
	expect(getMapItem(VOLUME_UNITS, "us-fluid-ounce").to(10, "milliliter")).toBeCloseTo(295.735);
	expect(getMapItem(VOLUME_UNITS, "us-pint").to(1, "milliliter")).toBeCloseTo(473.176);
	expect(getMapItem(VOLUME_UNITS, "us-pint").to(1, "us-fluid-ounce")).toBe(16);
	expect(getMapItem(VOLUME_UNITS, "us-gallon").to(2, "liter")).toBeCloseTo(7.571);
	expect(getMapItem(VOLUME_UNITS, "us-gallon").to(1, "us-pint")).toBe(8);
	expect(getMapItem(VOLUME_UNITS, "us-gallon").to(1, "us-fluid-ounce")).toBe(128);
	expect(getMapItem(VOLUME_UNITS, "imperial-fluid-ounce").to(12, "milliliter")).toBeCloseTo(340.957);
	expect(getMapItem(VOLUME_UNITS, "imperial-pint").to(1, "milliliter")).toBeCloseTo(568.261);
	expect(getMapItem(VOLUME_UNITS, "imperial-pint").to(1, "imperial-fluid-ounce")).toBe(20);
	expect(getMapItem(VOLUME_UNITS, "imperial-gallon").to(1, "milliliter")).toBeCloseTo(4546.09);
	expect(getMapItem(VOLUME_UNITS, "imperial-gallon").to(1, "imperial-pint")).toBe(8);
	expect(getMapItem(VOLUME_UNITS, "imperial-gallon").to(1, "imperial-fluid-ounce")).toBe(160);
	expect(getMapItem(VOLUME_UNITS, "cubic-inch").to(1000, "liter")).toBeCloseTo(16.3871);
	expect(getMapItem(VOLUME_UNITS, "cubic-foot").to(1, "liter")).toBeCloseTo(28.3168);
	expect(getMapItem(VOLUME_UNITS, "cubic-yard").to(1, "liter")).toBeCloseTo(764.555);

	// Temperature.
	expect(getMapItem(TEMPERATURE_UNITS, "celsius").to(100, "celsius")).toBe(100);
	expect(getMapItem(TEMPERATURE_UNITS, "celsius").to(50, "kelvin")).toBeCloseTo(323.15);
	expect(getMapItem(TEMPERATURE_UNITS, "kelvin").to(50, "celsius")).toBeCloseTo(-223.15);
	expect(getMapItem(TEMPERATURE_UNITS, "celsius").to(28, "fahrenheit")).toBeCloseTo(82.4);
	expect(getMapItem(TEMPERATURE_UNITS, "fahrenheit").to(70, "celsius")).toBeCloseTo(21.1111);
	expect(getMapItem(TEMPERATURE_UNITS, "celsius").to(-40, "fahrenheit")).toBe(-40);
	expect(getMapItem(TEMPERATURE_UNITS, "fahrenheit").to(-40, "celsius")).toBe(-40);
});
test("format() works correctly", () => {
	expect(getMapItem(LENGTH_UNITS, "meter").format(123)).toBe("123 m");
	expect(getMapItem(LENGTH_UNITS, "centimeter").format(1234)).toBe("1,234 cm");
	expect(getMapItem(LENGTH_UNITS, "foot").format(123)).toBe("123 ft");
	expect(getMapItem(LENGTH_UNITS, "yard").format(1234)).toBe("1,234 yd");
});
test("format() precision", () => {
	// Precision.
	expect(getMapItem(LENGTH_UNITS, "kilometer").format(1.1111, { maximumFractionDigits: 0, minimumFractionDigits: 0 })).toBe("1 km");
	expect(getMapItem(LENGTH_UNITS, "kilometer").format(1.1111, { maximumFractionDigits: 2, minimumFractionDigits: 2 })).toBe("1.11 km");
	expect(getMapItem(LENGTH_UNITS, "kilometer").format(1.1111, { maximumFractionDigits: 4, minimumFractionDigits: 4 })).toBe("1.1111 km");
	expect(getMapItem(LENGTH_UNITS, "kilometer").format(1.1111, { maximumFractionDigits: 6, minimumFractionDigits: 6 })).toBe("1.111100 km");

	// No precision.
	expect(getMapItem(LENGTH_UNITS, "kilometer").format(1.1111)).toBe("1.11 km");
});
test("pluralize() works correctly", () => {
	expect(getMapItem(LENGTH_UNITS, "meter").pluralize(1)).toBe("1 meter");
	expect(getMapItem(LENGTH_UNITS, "meter").pluralize(123)).toBe("123 meters");
	expect(getMapItem(LENGTH_UNITS, "meter").pluralize(1234)).toBe("1,234 meters");
	expect(getMapItem(LENGTH_UNITS, "foot").pluralize(1)).toBe("1 foot");
	expect(getMapItem(LENGTH_UNITS, "foot").pluralize(123)).toBe("123 feet");
	expect(getMapItem(LENGTH_UNITS, "foot").pluralize(1234)).toBe("1,234 feet");
	expect(getMapItem(LENGTH_UNITS, "yard").pluralize(1)).toBe("1 yard");
	expect(getMapItem(LENGTH_UNITS, "yard").pluralize(123)).toBe("123 yards");
	expect(getMapItem(LENGTH_UNITS, "yard").pluralize(1234)).toBe("1,234 yards");
});
test("pluralize() precision", () => {
	expect(getMapItem(LENGTH_UNITS, "kilometer").pluralize(1.1111, { maximumFractionDigits: 0, minimumFractionDigits: 0 })).toBe("1 kilometer");
	expect(getMapItem(LENGTH_UNITS, "kilometer").pluralize(1.1111, { maximumFractionDigits: 2, minimumFractionDigits: 2 })).toBe("1.11 kilometers");
	expect(getMapItem(LENGTH_UNITS, "kilometer").pluralize(1.1111, { maximumFractionDigits: 4, minimumFractionDigits: 4 })).toBe("1.1111 kilometers");
	expect(getMapItem(LENGTH_UNITS, "kilometer").pluralize(1.1111, { maximumFractionDigits: 6, minimumFractionDigits: 6 })).toBe("1.111100 kilometers");
});
