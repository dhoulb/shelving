import { detectUnit, formatUnit, convertUnits } from "..";

describe("detectDistanceUnit()", () => {
	test("Works correctly", () => {
		expect(detectUnit("1", "meter")).toBe("meter");

		expect(detectUnit("1m", "meter")).toBe("meter");
		expect(detectUnit("1 metre", "meter")).toBe("meter");
		expect(detectUnit("999 metres", "meter")).toBe("meter");
		expect(detectUnit("1 meter", "meter")).toBe("meter");
		expect(detectUnit("999 meters", "meter")).toBe("meter");

		expect(detectUnit("1cm", "meter")).toBe("centimeter");
		expect(detectUnit("1 centimeter", "meter")).toBe("centimeter");
		expect(detectUnit("999 centimeters", "meter")).toBe("centimeter");
		expect(detectUnit("1 centimetre", "meter")).toBe("centimeter");
		expect(detectUnit("999 centimetres", "meter")).toBe("centimeter");

		expect(detectUnit("1km", "meter")).toBe("kilometer");
		expect(detectUnit("1 kilometer", "meter")).toBe("kilometer");
		expect(detectUnit("999 kilometers", "meter")).toBe("kilometer");
		expect(detectUnit("1 kilometre", "meter")).toBe("kilometer");
		expect(detectUnit("999 kilometres", "meter")).toBe("kilometer");

		expect(detectUnit("1y", "meter")).toBe("yard");
		expect(detectUnit("1yd", "meter")).toBe("yard");
		expect(detectUnit("1 yard", "meter")).toBe("yard");
		expect(detectUnit("1 yards", "meter")).toBe("yard");

		expect(detectUnit("1f", "meter")).toBe("foot");
		expect(detectUnit("1ft", "meter")).toBe("foot");
		expect(detectUnit("1 foot", "meter")).toBe("foot");
		expect(detectUnit("1 feet", "meter")).toBe("foot");

		expect(detectUnit("1in", "meter")).toBe("inch");
		expect(detectUnit("1 inch", "meter")).toBe("inch");
		expect(detectUnit("999 inches", "meter")).toBe("inch");
	});
});
describe("convertDistance()", () => {
	test("Works correctly", () => {
		expect(convertUnits(1, "meter", "meter")).toBe(1);
		expect(convertUnits(1, "meter", "kilometer")).toBe(0.001);
		expect(convertUnits(1, "kilometer", "meter")).toBe(1000);
		expect(convertUnits(1, "meter", "foot")).toBeCloseTo(3.28084);
		expect(convertUnits(1, "foot", "meter")).toBeCloseTo(0.3048);
		expect(convertUnits(1, "meter", "yard")).toBeCloseTo(1.09361);
		expect(convertUnits(1, "yard", "meter")).toBeCloseTo(0.9144);
		expect(convertUnits(1, "yard", "foot")).toBe(3);
		expect(convertUnits(1, "foot", "yard")).toBeCloseTo(0.3333333);
		expect(convertUnits(1, "inch", "foot")).toBeCloseTo(0.0833333);
		expect(convertUnits(1, "foot", "inch")).toBe(12);
		expect(convertUnits(1, "inch", "yard")).toBeCloseTo(0.0277);
		expect(convertUnits(1, "yard", "inch")).toBe(36);
	});
});
describe("formatDistance()", () => {
	test("Works correctly", () => {
		expect(formatUnit(123, "meter")).toBe("123 m");
		expect(formatUnit(1234, "meter")).toBe("1,234 m");
		expect(formatUnit(1234.0123456789, "meter")).toBe("1,234 m");
		expect(formatUnit(1234.0123, "meter")).toBe("1,234 m");
		expect(formatUnit(1234, "meter")).toBe("1,234 m");
		expect(formatUnit(1234.0001, "meter")).toBe("1,234 m");
		expect(formatUnit(123, "foot")).toBe("123 ft");
		expect(formatUnit(1234, "yard")).toBe("1,234 yd");
		expect(formatUnit(1234.0123456789, "kilometer")).toBe("1,234.01 km");
		expect(formatUnit(1234.0123, "kilometer")).toBe("1,234.01 km");
		expect(formatUnit(1234.0123456789, "kilometer", 2)).toBe("1,234.01 km");
		expect(formatUnit(1234.0123, "kilometer", 2)).toBe("1,234.01 km");
		expect(formatUnit(1234, "kilometer")).toBe("1,234 km");
		expect(formatUnit(1234.0001, "foot")).toBe("1,234 ft");
	});
});
