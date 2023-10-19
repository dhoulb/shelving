import { ANGLE_UNITS, AREA_UNITS, LENGTH_UNITS, MASS_UNITS, SPEED_UNITS, TEMPERATURE_UNITS, TIME_UNITS, VOLUME_UNITS } from "../index.js";

test("to() works correctly with base", () => {
	expect(LENGTH_UNITS.getUnit("millimeter").to(1)).toBe(1);
	expect(LENGTH_UNITS.getUnit("meter").to(1)).toBe(1000);
});
test("to() works correctly", () => {
	// Angle.
	expect(ANGLE_UNITS.getUnit("degree").to(123, "degree")).toBe(123);
	expect(ANGLE_UNITS.getUnit("degree").to(180, "gradian")).toBe(200);
	expect(ANGLE_UNITS.getUnit("gradian").to(200, "degree")).toBe(180);
	expect(ANGLE_UNITS.getUnit("degree").to(180, "radian")).toBeCloseTo(Math.PI);
	expect(ANGLE_UNITS.getUnit("radian").to(Math.PI, "degree")).toBeCloseTo(180);

	// Length.
	expect(LENGTH_UNITS.getUnit("meter").to(123, "meter")).toBe(123);
	expect(LENGTH_UNITS.getUnit("millimeter").to(1000, "meter")).toBe(1);
	expect(LENGTH_UNITS.getUnit("meter").to(1, "millimeter")).toBe(1000);
	expect(LENGTH_UNITS.getUnit("meter").to(1, "kilometer")).toBe(0.001);
	expect(LENGTH_UNITS.getUnit("kilometer").to(1, "meter")).toBe(1000);
	expect(LENGTH_UNITS.getUnit("meter").to(1, "foot")).toBeCloseTo(3.28084);
	expect(LENGTH_UNITS.getUnit("foot").to(1, "meter")).toBeCloseTo(0.3048);
	expect(LENGTH_UNITS.getUnit("meter").to(1, "yard")).toBeCloseTo(1.09361);
	expect(LENGTH_UNITS.getUnit("yard").to(1, "meter")).toBeCloseTo(0.9144);
	expect(LENGTH_UNITS.getUnit("yard").to(1, "foot")).toBe(3);
	expect(LENGTH_UNITS.getUnit("foot").to(1, "yard")).toBeCloseTo(0.3333333);
	expect(LENGTH_UNITS.getUnit("inch").to(1, "foot")).toBeCloseTo(0.0833333);
	expect(LENGTH_UNITS.getUnit("foot").to(1, "inch")).toBe(12);
	expect(LENGTH_UNITS.getUnit("inch").to(1, "yard")).toBeCloseTo(0.0277);
	expect(LENGTH_UNITS.getUnit("yard").to(1, "inch")).toBe(36);

	// Time.
	expect(TIME_UNITS.getUnit("millisecond").to(1000, "millisecond")).toBe(1000);
	expect(TIME_UNITS.getUnit("hour").to(1, "millisecond")).toBe(60 * 60 * 1000);
	expect(TIME_UNITS.getUnit("year").to(1, "millisecond")).toBe(365 * 24 * 60 * 60 * 1000);

	// Speed.
	expect(SPEED_UNITS.getUnit("meter-per-second").to(123, "meter-per-second")).toBe(123);
	expect(SPEED_UNITS.getUnit("meter-per-second").to(1000, "mile-per-hour")).toBeCloseTo(2236.94);
	expect(SPEED_UNITS.getUnit("mile-per-hour").to(1000, "meter-per-second")).toBeCloseTo(447.04);
	expect(SPEED_UNITS.getUnit("meter-per-second").to(1000, "kilometer-per-hour")).toBe(3600);
	expect(SPEED_UNITS.getUnit("kilometer-per-hour").to(1000, "meter-per-second")).toBeCloseTo(277.777);
	expect(SPEED_UNITS.getUnit("mile-per-hour").to(1000, "kilometer-per-hour")).toBeCloseTo(1609.34);
	expect(SPEED_UNITS.getUnit("kilometer-per-hour").to(1000, "mile-per-hour")).toBeCloseTo(621.371);

	// Mass.
	expect(MASS_UNITS.getUnit("milligram").to(1000, "milligram")).toBe(1000);
	expect(MASS_UNITS.getUnit("milligram").to(1000000, "kilogram")).toBe(1);
	expect(MASS_UNITS.getUnit("kilogram").to(1, "milligram")).toBe(1000000);

	// Area.
	expect(AREA_UNITS.getUnit("square-millimeter").to(123, "square-millimeter")).toBe(123);
	expect(AREA_UNITS.getUnit("hectare").to(1, "square-meter")).toBe(10000);
	expect(AREA_UNITS.getUnit("square-inch").to(1000, "square-millimeter")).toBe(645160);
	expect(AREA_UNITS.getUnit("square-foot").to(1000, "square-meter")).toBeCloseTo(92.903);
	expect(AREA_UNITS.getUnit("square-foot").to(1, "square-inch")).toBe(12 * 12);
	expect(AREA_UNITS.getUnit("square-yard").to(1000, "square-meter")).toBeCloseTo(836.127);
	expect(AREA_UNITS.getUnit("square-yard").to(1, "square-foot")).toBe(3 * 3);
	expect(AREA_UNITS.getUnit("square-yard").to(1, "square-inch")).toBe(36 * 36);
	expect(AREA_UNITS.getUnit("acre").to(1, "square-meter")).toBeCloseTo(4046.86);

	// Volume.
	expect(VOLUME_UNITS.getUnit("milliliter").to(123, "milliliter")).toBe(123);
	expect(VOLUME_UNITS.getUnit("milliliter").to(1000, "liter")).toBe(1);
	expect(VOLUME_UNITS.getUnit("liter").to(1, "milliliter")).toBe(1000);
	expect(VOLUME_UNITS.getUnit("cubic-centimeter").to(123, "milliliter")).toBe(123);
	expect(VOLUME_UNITS.getUnit("cubic-meter").to(1, "cubic-centimeter")).toBe(100 * 100 * 100);
	expect(VOLUME_UNITS.getUnit("us-fluid-ounce").to(10, "milliliter")).toBeCloseTo(295.735);
	expect(VOLUME_UNITS.getUnit("us-pint").to(1, "milliliter")).toBeCloseTo(473.176);
	expect(VOLUME_UNITS.getUnit("us-pint").to(1, "us-fluid-ounce")).toBe(16);
	expect(VOLUME_UNITS.getUnit("us-gallon").to(2, "liter")).toBeCloseTo(7.571);
	expect(VOLUME_UNITS.getUnit("us-gallon").to(1, "us-pint")).toBe(8);
	expect(VOLUME_UNITS.getUnit("us-gallon").to(1, "us-fluid-ounce")).toBe(128);
	expect(VOLUME_UNITS.getUnit("imperial-fluid-ounce").to(12, "milliliter")).toBeCloseTo(340.957);
	expect(VOLUME_UNITS.getUnit("imperial-pint").to(1, "milliliter")).toBeCloseTo(568.261);
	expect(VOLUME_UNITS.getUnit("imperial-pint").to(1, "imperial-fluid-ounce")).toBe(20);
	expect(VOLUME_UNITS.getUnit("imperial-gallon").to(1, "milliliter")).toBeCloseTo(4546.09);
	expect(VOLUME_UNITS.getUnit("imperial-gallon").to(1, "imperial-pint")).toBe(8);
	expect(VOLUME_UNITS.getUnit("imperial-gallon").to(1, "imperial-fluid-ounce")).toBe(160);
	expect(VOLUME_UNITS.getUnit("cubic-inch").to(1000, "liter")).toBeCloseTo(16.3871);
	expect(VOLUME_UNITS.getUnit("cubic-foot").to(1, "liter")).toBeCloseTo(28.3168);
	expect(VOLUME_UNITS.getUnit("cubic-yard").to(1, "liter")).toBeCloseTo(764.555);

	// Temperature.
	expect(TEMPERATURE_UNITS.getUnit("celsius").to(100, "celsius")).toBe(100);
	expect(TEMPERATURE_UNITS.getUnit("celsius").to(50, "kelvin")).toBeCloseTo(323.15);
	expect(TEMPERATURE_UNITS.getUnit("kelvin").to(50, "celsius")).toBeCloseTo(-223.15);
	expect(TEMPERATURE_UNITS.getUnit("celsius").to(28, "fahrenheit")).toBeCloseTo(82.4);
	expect(TEMPERATURE_UNITS.getUnit("fahrenheit").to(70, "celsius")).toBeCloseTo(21.1111);
	expect(TEMPERATURE_UNITS.getUnit("celsius").to(-40, "fahrenheit")).toBe(-40);
	expect(TEMPERATURE_UNITS.getUnit("fahrenheit").to(-40, "celsius")).toBe(-40);
});
test("format() works correctly", () => {
	expect(LENGTH_UNITS.getUnit("meter").format(123)).toBe("123 m");
	expect(LENGTH_UNITS.getUnit("centimeter").format(1234)).toBe("1,234 cm");
	expect(LENGTH_UNITS.getUnit("foot").format(123)).toBe("123 ft");
	expect(LENGTH_UNITS.getUnit("yard").format(1234)).toBe("1,234 yd");
});
test("format() precision", () => {
	// Precision.
	expect(LENGTH_UNITS.getUnit("kilometer").format(1.1111, { maximumFractionDigits: 0, minimumFractionDigits: 0 })).toBe("1km");
	expect(LENGTH_UNITS.getUnit("kilometer").format(1.1111, { maximumFractionDigits: 2, minimumFractionDigits: 2 })).toBe("1.11 km");
	expect(LENGTH_UNITS.getUnit("kilometer").format(1.1111, { maximumFractionDigits: 4, minimumFractionDigits: 4 })).toBe("1.1111 km");
	expect(LENGTH_UNITS.getUnit("kilometer").format(1.1111, { maximumFractionDigits: 6, minimumFractionDigits: 6 })).toBe("1.111100 km");
});
test("pluralize() works correctly", () => {
	expect(LENGTH_UNITS.getUnit("meter").pluralize(1)).toBe("1 meter");
	expect(LENGTH_UNITS.getUnit("meter").pluralize(123)).toBe("123 meters");
	expect(LENGTH_UNITS.getUnit("meter").pluralize(1234)).toBe("1,234 meters");
	expect(LENGTH_UNITS.getUnit("foot").pluralize(1)).toBe("1 foot");
	expect(LENGTH_UNITS.getUnit("foot").pluralize(123)).toBe("123 feet");
	expect(LENGTH_UNITS.getUnit("foot").pluralize(1234)).toBe("1,234 feet");
	expect(LENGTH_UNITS.getUnit("yard").pluralize(1)).toBe("1 yard");
	expect(LENGTH_UNITS.getUnit("yard").pluralize(123)).toBe("123 yards");
	expect(LENGTH_UNITS.getUnit("yard").pluralize(1234)).toBe("1,234 yards");
});
test("pluralize() precision", () => {
	expect(LENGTH_UNITS.getUnit("kilometer").pluralize(1.1111, { maximumFractionDigits: 0, minimumFractionDigits: 0 })).toBe("1 kilometer");
	expect(LENGTH_UNITS.getUnit("kilometer").pluralize(1.1111, { maximumFractionDigits: 2, minimumFractionDigits: 2 })).toBe("1.11 kilometers");
	expect(LENGTH_UNITS.getUnit("kilometer").pluralize(1.1111, { maximumFractionDigits: 4, minimumFractionDigits: 4 })).toBe("1.1111 kilometers");
	expect(LENGTH_UNITS.getUnit("kilometer").pluralize(1.1111, { maximumFractionDigits: 6, minimumFractionDigits: 6 })).toBe("1.111100 kilometers");
});
