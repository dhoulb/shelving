import { describe, expect, test } from "bun:test";
import type { PossibleDate } from "../index.js";
import { DAY, HOUR, YEAR, getDate, getYMD, requireYMD } from "../index.js";
import { formatWhen, getMillisecondsUntil, requireTime } from "./date.js";

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
describe("getYMD()", () => {
	test("getYMD(): Correctly converts date to string", () => {
		expect(getYMD(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(getYMD(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(getYMD(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("getYMD(): Correctly converts possible dates to sring", () => {
		expect(getYMD("2019-11-27")).toBe("2019-11-27");
		expect(getYMD("0001-01-01")).toBe("0001-01-01");
		expect(getYMD("9999-12-31")).toBe("9999-12-31");
		expect(getYMD(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(getYMD(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(getYMD(new Date("9999-12-31").getTime())).toBe("9999-12-31");
		expect(typeof getYMD("now")).toBe("string");
	});
	test("getYMD(): Correctly converts invalid dates and other things to undefined", () => {
		expect<string | undefined>(getYMD(null)).toBe(undefined);
		expect<string | undefined>(getYMD("nope")).toBe(undefined);
		expect<string | undefined>(getYMD(new Date(Number.POSITIVE_INFINITY))).toBe(undefined);
		expect<string | undefined>(getYMD(new Date("nope"))).toBe(undefined);
	});
});
describe("requireYMD()", () => {
	test("requireYMD(): Correctly converts date to string", () => {
		expect(requireYMD(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(requireYMD(new Date("2019-07-27"))).toBe("2019-07-27");
		expect(requireYMD(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(requireYMD(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("requireYMD(): Correctly converts possible dates to sring", () => {
		expect(requireYMD("2019-11-27")).toBe("2019-11-27");
		expect(requireYMD("0001-01-01")).toBe("0001-01-01");
		expect(requireYMD("9999-12-31")).toBe("9999-12-31");
		expect(requireYMD(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(requireYMD(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(requireYMD(new Date("9999-12-31").getTime())).toBe("9999-12-31");
	});
	test("requireYMD(): Correctly throws on invalid dates", () => {
		expect(() => requireYMD(null as unknown as PossibleDate)).toThrow(Error);
		expect(() => requireYMD("nope")).toThrow(Error);
		expect(() => requireYMD(new Date(Number.POSITIVE_INFINITY))).toThrow(Error);
		expect(() => requireYMD(new Date("nope"))).toThrow(Error);
	});
});
describe("requireTime()", () => {
	test("requireTime(): Correctly converts possible timestamp to string", () => {
		expect(requireTime("20:30")).toBe("20:30:00");
		expect(requireTime("20:19")).toBe("20:19:00");
		expect(requireTime("01:15:20")).toBe("01:15:20");
		expect(requireTime("12:34:56")).toBe("12:34:56");
		expect(requireTime("2019-11-27T12:34:56")).toBe("12:34:56");
		expect(requireTime("0001-01-01T12:34:56")).toBe("12:34:56");
		expect(requireTime("9999-12-31T12:34:56")).toBe("12:34:56");
		expect(requireTime(new Date("2019-11-27T12:34:56").getTime())).toBe("12:34:56");
		expect(requireTime(new Date("0001-01-01T12:34:56").getTime())).toBe("12:34:56");
		expect(requireTime(new Date("9999-12-31T12:34:56").getTime())).toBe("12:34:56");
	});
	test("requireTime(): Correctly throws on invalid dates", () => {
		expect(() => requireYMD(null as unknown as PossibleDate)).toThrow(Error);
		expect(() => requireYMD("nope")).toThrow(Error);
		expect(() => requireYMD(new Date(Number.POSITIVE_INFINITY))).toThrow(Error);
		expect(() => requireYMD(new Date("nope"))).toThrow(Error);
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
