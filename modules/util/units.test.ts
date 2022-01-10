import { formatUnits, convertUnits, formatFullUnits } from "../index.js";

describe("convertUnits()", () => {
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
describe("formatUnits()", () => {
	test("Works correctly", () => {
		expect(formatUnits(123, "meter")).toBe("123 m");
		expect(formatUnits(1234, "centimeter")).toBe("1,234 cm");
		expect(formatUnits(123, "foot")).toBe("123 ft");
		expect(formatUnits(1234, "yard")).toBe("1,234 yd");
	});
	test("Max precision", () => {
		expect(formatUnits(1.1111, "kilometer", 0)).toBe("1 km");
		expect(formatUnits(1.1111, "kilometer", 2)).toBe("1.11 km");
		expect(formatUnits(1.1111, "kilometer", 4)).toBe("1.1111 km");
		expect(formatUnits(1.1111, "kilometer", 6)).toBe("1.1111 km");
	});
	test("Min precision", () => {
		expect(formatUnits(1.1111, "kilometer", 2, 0)).toBe("1.11 km");
		expect(formatUnits(1.1111, "kilometer", 2, 2)).toBe("1.11 km");
		expect(formatUnits(1.1111, "kilometer", 4, 4)).toBe("1.1111 km");
		expect(formatUnits(1.1111, "kilometer", 6, 6)).toBe("1.111100 km");
		expect(formatUnits(1.1, "kilometer", 2, 0)).toBe("1.1 km");
		expect(formatUnits(1.1, "kilometer", 2, 2)).toBe("1.10 km");
	});
});
describe("formatFullUnits()", () => {
	test("Works correctly", () => {
		expect(formatFullUnits(1, "meter")).toBe("1 meter");
		expect(formatFullUnits(123, "meter")).toBe("123 meters");
		expect(formatFullUnits(1234, "meter")).toBe("1,234 meters");
		expect(formatFullUnits(1, "foot")).toBe("1 foot");
		expect(formatFullUnits(123, "foot")).toBe("123 feet");
		expect(formatFullUnits(1234, "foot")).toBe("1,234 feet");
		expect(formatFullUnits(1, "yard")).toBe("1 yard");
		expect(formatFullUnits(123, "yard")).toBe("123 yards");
		expect(formatFullUnits(1234, "yard")).toBe("1,234 yards");
	});
	test("Max precision", () => {
		expect(formatFullUnits(1.1111, "kilometer", 0)).toBe("1 kilometer");
		expect(formatFullUnits(1.1111, "kilometer", 2)).toBe("1.11 kilometers");
		expect(formatFullUnits(1.1111, "kilometer", 4)).toBe("1.1111 kilometers");
		expect(formatFullUnits(1.1111, "kilometer", 6)).toBe("1.1111 kilometers");
	});
	test("Min precision", () => {
		expect(formatFullUnits(1.1111, "kilometer", 2, 0)).toBe("1.11 kilometers");
		expect(formatFullUnits(1.1111, "kilometer", 2, 2)).toBe("1.11 kilometers");
		expect(formatFullUnits(1.1111, "kilometer", 4, 4)).toBe("1.1111 kilometers");
		expect(formatFullUnits(1.1111, "kilometer", 6, 6)).toBe("1.111100 kilometers");
		expect(formatFullUnits(1.1, "kilometer", 2, 0)).toBe("1.1 kilometers");
		expect(formatFullUnits(1.1, "kilometer", 2, 2)).toBe("1.10 kilometers");
	});
});
