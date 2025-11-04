import { describe, expect, test } from "bun:test";
import { DAY, HOUR, YEAR } from "./constants.js";
import { formatAgo, formatDuration, formatNumber, formatPercent, formatUnit, formatUntil, formatValue, formatWhen } from "./format.js";

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
test("formatWhen()", () => {
	// Simple tests.
	expect(formatWhen(DAY, DAY * 2, { unitDisplay: "narrow" })).toBe("24h ago");
	expect(formatWhen(HOUR * 10, HOUR, { unitDisplay: "narrow" })).toBe("in 9h");
	expect(formatWhen(DAY, DAY * 2, { unitDisplay: "short" })).toBe("24 hr ago");
	expect(formatWhen(HOUR * 10, HOUR, { unitDisplay: "short" })).toBe("in 9 hr");
	expect(formatWhen(DAY, DAY * 2)).toBe("24 hr ago"); // default is "short"
	expect(formatWhen(HOUR * 10, HOUR)).toBe("in 9 hr"); // default is "short"
	expect(formatWhen(HOUR * 10, HOUR, { unitDisplay: "long" })).toBe("in 9 hours");

	// Rounding tests.
	expect(formatWhen(DAY, YEAR * 1 + DAY * 10, { unitDisplay: "long" })).toBe("12 months ago");
});
test("formatAgo()", () => {
	expect(formatAgo(DAY, DAY * 2, { unitDisplay: "narrow" })).toBe("24h");
	expect(formatAgo(HOUR * 10, HOUR, { unitDisplay: "narrow" })).toBe("-9h");
});
test("formatUntil()", () => {
	expect(formatUntil(DAY, DAY * 2, { unitDisplay: "narrow" })).toBe("-24h");
	expect(formatUntil(HOUR * 10, HOUR, { unitDisplay: "narrow" })).toBe("9h");
});
test("formatDuration()", () => {
	// Default.
	expect(formatDuration({ seconds: 12 })).toBe("12 sec");
	expect(formatDuration({ hours: 9 })).toBe("9 hr");
	expect(formatDuration({ years: 2, months: 6 })).toBe("2 yrs, 6 mths");

	// Narrow.
	expect(formatDuration({ seconds: 1 }, { style: "narrow" })).toBe("1s");
	expect(formatDuration({ seconds: 12 }, { style: "narrow" })).toBe("12s");
	expect(formatDuration({ hours: 1 }, { style: "narrow" })).toBe("1h");
	expect(formatDuration({ hours: 9 }, { style: "narrow" })).toBe("9h");
	expect(formatDuration({ years: 2, minutes: 8 }, { style: "narrow" })).toBe("2y 8m");
	expect(
		formatDuration({ years: 9, months: 8, weeks: 7, days: 6, hours: 5, minutes: 4, seconds: 3, milliseconds: 2 }, { style: "narrow" }),
	).toMatch(/9y 8mo? 7w 6d 5h 4m 3s 2ms/); // Weirdness where "months" can be abbreviated as "m" or "mo".

	// Short.
	expect(formatDuration({ seconds: 1 }, { style: "short" })).toBe("1 sec");
	expect(formatDuration({ seconds: 12 }, { style: "short" })).toBe("12 sec");
	expect(formatDuration({ hours: 1 }, { style: "short" })).toBe("1 hr");
	expect(formatDuration({ hours: 9 }, { style: "short" })).toBe("9 hr");
	expect(formatDuration({ years: 2, minutes: 8 }, { style: "short" })).toBe("2 yrs, 8 min");

	// Long.
	expect(formatDuration({ seconds: 1 }, { style: "long" })).toBe("1 second");
	expect(formatDuration({ seconds: 12 }, { style: "long" })).toBe("12 seconds");
	expect(formatDuration({ hours: 1 }, { style: "long" })).toBe("1 hour");
	expect(formatDuration({ hours: 9 }, { style: "long" })).toBe("9 hours");
	expect(formatDuration({ years: 1, minutes: 1 }, { style: "long" })).toBe("1 year, 1 minute");
	expect(formatDuration({ years: 2, minutes: 8 }, { style: "long" })).toBe("2 years, 8 minutes");
});
