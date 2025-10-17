import { describe, expect, test } from "bun:test";
import type { PossibleDate } from "../index.js";
import { DAY, getDate, getDateString, HOUR, requireDateString, YEAR } from "../index.js";
import { formatWhen, getMillisecondsUntil, requireTimeString } from "./date.js";

describe("getDate()", () => {
	test("getDate(): Parses valid possible dates to Date instances", () => {
		expect(getDate(new Date("2019-11-27"))).toBeInstanceOf(Date);
		expect(getDate(new Date())).toBeInstanceOf(Date);
		expect(getDate("2019-11-27")).toBeInstanceOf(Date);
		expect(getDate("20:30")).toBeInstanceOf(Date);
		expect(getDate("11:22:33")).toBeInstanceOf(Date);
		expect(getDate("2019-11-27T11:22:33")).toBeInstanceOf(Date);
		expect(getDate("2019-11-27 11:22:33")).toBeInstanceOf(Date);
		expect(getDate("2019-11-27T11:22")).toBeInstanceOf(Date);
		expect(getDate("2019-11-27 11:22")).toBeInstanceOf(Date);
		expect(getDate("now")).toBeInstanceOf(Date);
		expect(getDate("yesterday")).toBeInstanceOf(Date);
		expect(getDate("today")).toBeInstanceOf(Date);
		expect(getDate("tomorrow")).toBeInstanceOf(Date);
		expect(getDate(new Date("9999-12-31").getTime())).toBeInstanceOf(Date);
		expect(getDate(0)).toBeInstanceOf(Date);
		expect(getDate(new Date("0000-01-01").getTime())).toBeInstanceOf(Date);
	});
	test("getDate(): Parses invalid values to undefined", () => {
		expect<Date | undefined>(getDate(undefined)).toBe(undefined);
		expect<Date | undefined>(getDate(null)).toBe(undefined);
		expect<Date | undefined>(getDate("")).toBe(undefined);
		expect<Date | undefined>(getDate(true)).toBe(undefined);
		expect<Date | undefined>(getDate(false)).toBe(undefined);
		expect<Date | undefined>(getDate(new Date(""))).toBe(undefined);
		expect<Date | undefined>(getDate(() => null)).toBe(undefined);
		expect<Date | undefined>(getDate(() => "")).toBe(undefined);
		expect<Date | undefined>(getDate(() => true)).toBe(undefined);
		expect<Date | undefined>(getDate(() => false)).toBe(undefined);
		expect<Date | undefined>(getDate(() => new Date(""))).toBe(undefined);
	});
});
describe("getDateString()", () => {
	test("getDateString(): Correctly converts date to string", () => {
		expect(getDateString(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(getDateString(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(getDateString(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("getDateString(): Correctly converts possible dates to sring", () => {
		expect(getDateString("2019-11-27")).toBe("2019-11-27");
		expect(getDateString("0001-01-01")).toBe("0001-01-01");
		expect(getDateString("9999-12-31")).toBe("9999-12-31");
		expect(getDateString(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(getDateString(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(getDateString(new Date("9999-12-31").getTime())).toBe("9999-12-31");
		expect(typeof getDateString("now")).toBe("string");
	});
	test("getDateString(): Correctly converts invalid dates and other things to undefined", () => {
		expect<string | undefined>(getDateString(null)).toBe(undefined);
		expect<string | undefined>(getDateString("nope")).toBe(undefined);
		expect<string | undefined>(getDateString(new Date(Number.POSITIVE_INFINITY))).toBe(undefined);
		expect<string | undefined>(getDateString(new Date("nope"))).toBe(undefined);
	});
});
describe("requireDateString()", () => {
	test("requireDateString(): Correctly converts date to string", () => {
		expect(requireDateString(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(requireDateString(new Date("2019-07-27"))).toBe("2019-07-27");
		expect(requireDateString(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(requireDateString(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("requireDateString(): Correctly converts possible dates to sring", () => {
		expect(requireDateString("2019-11-27")).toBe("2019-11-27");
		expect(requireDateString("0001-01-01")).toBe("0001-01-01");
		expect(requireDateString("9999-12-31")).toBe("9999-12-31");
		expect(requireDateString(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(requireDateString(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(requireDateString(new Date("9999-12-31").getTime())).toBe("9999-12-31");
	});
	test("requireDateString(): Correctly throws on invalid dates", () => {
		expect(() => requireDateString(null as unknown as PossibleDate)).toThrow(Error);
		expect(() => requireDateString("nope")).toThrow(Error);
		expect(() => requireDateString(new Date(Number.POSITIVE_INFINITY))).toThrow(Error);
		expect(() => requireDateString(new Date("nope"))).toThrow(Error);
	});
});
describe("requireTimeString()", () => {
	test("requireTimeString(): Correctly converts possible timestamp to string", () => {
		expect(requireTimeString("20:30")).toBe("20:30:00");
		expect(requireTimeString("20:19")).toBe("20:19:00");
		expect(requireTimeString("01:15:20")).toBe("01:15:20");
		expect(requireTimeString("12:34:56")).toBe("12:34:56");
		expect(requireTimeString("2019-11-27T12:34:56")).toBe("12:34:56");
		expect(requireTimeString("0001-01-01T12:34:56")).toBe("12:34:56");
		expect(requireTimeString("9999-12-31T12:34:56")).toBe("12:34:56");
		expect(requireTimeString(new Date("2019-11-27T12:34:56").getTime())).toBe("12:34:56");
		expect(requireTimeString(new Date("0001-01-01T12:34:56").getTime())).toBe("12:34:56");
		expect(requireTimeString(new Date("9999-12-31T12:34:56").getTime())).toBe("12:34:56");
	});
	test("requireTimeString(): Correctly throws on invalid dates", () => {
		expect(() => requireDateString(null as unknown as PossibleDate)).toThrow(Error);
		expect(() => requireDateString("nope")).toThrow(Error);
		expect(() => requireDateString(new Date(Number.POSITIVE_INFINITY))).toThrow(Error);
		expect(() => requireDateString(new Date("nope"))).toThrow(Error);
	});
});
test("getDuration()", () => {
	expect(getMillisecondsUntil(10000000, 20000000)).toBe(-10000000);
});
test("formatWhen()", () => {
	// Simple tests.
	expect(formatWhen(DAY, DAY * 2, { unitDisplay: "narrow" })).toBe("24h ago");
	expect(formatWhen(HOUR * 10, HOUR, { unitDisplay: "narrow" })).toBe("in 9h");
	expect(formatWhen(DAY, DAY * 2, { unitDisplay: "short" })).toBe("24 hr ago");
	expect(formatWhen(HOUR * 10, HOUR, { unitDisplay: "short" })).toBe("in 9 hr");
	expect(formatWhen(DAY, DAY * 2)).toBe("24 hr ago"); // default is "short"
	expect(formatWhen(HOUR * 10, HOUR)).toBe("in 9 hr"); // default is "short"
	expect(formatWhen(HOUR * 10, HOUR, { unitDisplay: "long" })).toBe("in 9 hours");

	// Rounding tests.
	expect(formatWhen(DAY, YEAR * 1 + DAY * 10, { unitDisplay: "long" })).toBe("12 months ago");
});
