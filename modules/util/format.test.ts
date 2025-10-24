import { describe, expect, test } from "bun:test";
import { formatNumber, formatPercent, formatUnit, formatValue } from "./format.js";

describe("formatNumber()", () => {
	test("Works correctly", () => {
		expect(formatNumber(123)).toBe("123");
		expect(formatNumber(1234)).toBe("1,234");
		expect(formatNumber(1234.0)).toBe("1,234");
		expect(formatNumber(1234.0, { useGrouping: false })).toBe("1234");
	});
});
describe("formatPercent()", () => {
	test("Works correctly", () => {
		expect(formatPercent(1, 100)).toBe("1%");
		expect(formatPercent(1, 10)).toBe("10%");
		expect(formatPercent(1, 1)).toBe("100%");
		expect(formatPercent(10, 1)).toBe("1,000%");
		expect(formatPercent(100, 1)).toBe("10,000%");
		expect(formatPercent(10, 1, { useGrouping: false })).toBe("1000%");
		expect(formatPercent(100, 1, { useGrouping: false })).toBe("10000%");
	});
});
describe("formatUnit()", () => {
	test("Works correctly", () => {
		// Built in units.
		expect(formatUnit(1, "minute")).toBe("1 min");
		expect(formatUnit(1000, "minute")).toBe("1,000 min");
		expect(formatUnit(1000, "minute", { useGrouping: false })).toBe("1000 min");
		expect(formatUnit(1, "minute", { unitDisplay: "narrow" })).toBe("1m");
		expect(formatUnit(1000, "minute", { unitDisplay: "narrow" })).toBe("1,000m");
		expect(formatUnit(1, "minute", { unitDisplay: "long" })).toBe("1 minute");
		expect(formatUnit(1000, "minute", { unitDisplay: "long" })).toBe("1,000 minutes");

		// Other units.
		expect(formatUnit(1, "dog")).toBe("1 dog");
		expect(formatUnit(1000, "dog")).toBe("1,000 dog");
		expect(formatUnit(1000, "dog", { useGrouping: false })).toBe("1000 dog");
		expect(formatUnit(1, "dog", { unitDisplay: "narrow" })).toBe("1dog");
		expect(formatUnit(1000, "dog", { unitDisplay: "narrow" })).toBe("1,000dog");
		expect(formatUnit(1, "dog", { unitDisplay: "long" })).toBe("1 dog");
		expect(formatUnit(1000, "dog", { unitDisplay: "long" })).toBe("1,000 dogs");

		// Other units with custom style.
		expect(formatUnit(1, "dog", { abbr: "🐶", one: "puppy", many: "puppies" })).toBe("1 🐶");
		expect(formatUnit(1000, "dog", { abbr: "🐶", one: "puppy", many: "puppies" })).toBe("1,000 🐶");
		expect(formatUnit(1000, "dog", { abbr: "🐶", one: "puppy", many: "puppies", useGrouping: false })).toBe("1000 🐶");
		expect(formatUnit(1, "dog", { abbr: "🐶", one: "puppy", many: "puppies", unitDisplay: "narrow" })).toBe("1🐶");
		expect(formatUnit(1000, "dog", { abbr: "🐶", one: "puppy", many: "puppies", unitDisplay: "narrow" })).toBe("1,000🐶");
		expect(formatUnit(1, "dog", { abbr: "🐶", one: "puppy", many: "puppies", unitDisplay: "long" })).toBe("1 puppy");
		expect(formatUnit(1000, "dog", { abbr: "🐶", one: "puppy", many: "puppies", unitDisplay: "long" })).toBe("1,000 puppies");
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
