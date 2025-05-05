import { describe, expect, test } from "bun:test";
import { formatNumber, formatValue } from "./format.js";

describe("formatNumber()", () => {
	test("Works correctly", () => {
		expect(formatNumber(123)).toBe("123");
		expect(formatNumber(1234)).toBe("1,234");
		expect(formatNumber(1234.0)).toBe("1,234");
	});
});
describe("formatValue()", () => {
	test("Correct returned value", () => {
		expect(formatValue("aaa")).toBe("aaa");
		expect(formatValue(123)).toBe("123");
		expect(formatValue(123456789)).toBe("123,456,789");
		expect(formatValue(123.1)).toBe("123.1");
		expect(formatValue(true)).toBe("Yes");
		expect(formatValue(false)).toBe("No");
		expect(formatValue(null)).toBe("None");
		expect(formatValue(undefined)).toBe("None");
		expect(formatValue({ title: "aaa" })).toBe("aaa");
		expect(formatValue({ name: "aaa" })).toBe("aaa");
		expect(formatValue({})).toBe("Object");
		expect(formatValue(Symbol())).toBe("Symbol");
	});
});
