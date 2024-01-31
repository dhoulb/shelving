import type { PossibleDate } from "../index.js";
import { getOptionalDate, getOptionalYMD, getYMD } from "../index.js";

describe("getOptionalDate()", () => {
	test("getOptionalDate(): Parses valid possible dates to Date instances", () => {
		expect(getOptionalDate(new Date("2019-11-27"))).toBeInstanceOf(Date);
		expect(getOptionalDate(new Date())).toBeInstanceOf(Date);
		expect(getOptionalDate("2019-11-27")).toBeInstanceOf(Date);
		expect(getOptionalDate("now")).toBeInstanceOf(Date);
		expect(getOptionalDate("yesterday")).toBeInstanceOf(Date);
		expect(getOptionalDate("today")).toBeInstanceOf(Date);
		expect(getOptionalDate("tomorrow")).toBeInstanceOf(Date);
		expect(getOptionalDate(new Date("9999-12-31").getTime())).toBeInstanceOf(Date);
		expect(getOptionalDate(0)).toBeInstanceOf(Date);
		expect(getOptionalDate(new Date("0000-01-01").getTime())).toBeInstanceOf(Date);
	});
	test("getOptionalDate(): Parses invalid values to undefined", () => {
		expect(getOptionalDate(undefined)).toBe(undefined);
		expect(getOptionalDate(null)).toBe(undefined);
		expect(getOptionalDate("")).toBe(undefined);
		expect(getOptionalDate(true)).toBe(undefined);
		expect(getOptionalDate(false)).toBe(undefined);
		expect(getOptionalDate(new Date(""))).toBe(undefined);
		expect(getOptionalDate(() => null)).toBe(undefined);
		expect(getOptionalDate(() => "")).toBe(undefined);
		expect(getOptionalDate(() => true)).toBe(undefined);
		expect(getOptionalDate(() => false)).toBe(undefined);
		expect(getOptionalDate(() => new Date(""))).toBe(undefined);
	});
});
describe("getOptionalYMD()", () => {
	test("getOptionalYMD(): Correctly converts date to string", () => {
		expect(getOptionalYMD(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(getOptionalYMD(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(getOptionalYMD(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("getOptionalYMD(): Correctly converts possible dates to sring", () => {
		expect(getOptionalYMD("2019-11-27")).toBe("2019-11-27");
		expect(getOptionalYMD("0001-01-01")).toBe("0001-01-01");
		expect(getOptionalYMD("9999-12-31")).toBe("9999-12-31");
		expect(getOptionalYMD(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(getOptionalYMD(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(getOptionalYMD(new Date("9999-12-31").getTime())).toBe("9999-12-31");
		expect(typeof getOptionalYMD("now")).toBe("string");
	});
	test("getOptionalYMD(): Correctly converts invalid dates and other things to undefined", () => {
		expect(getOptionalYMD(null)).toBe(undefined);
		expect(getOptionalYMD("nope")).toBe(undefined);
		expect(getOptionalYMD(new Date(Infinity))).toBe(undefined);
		expect(getOptionalYMD(new Date("nope"))).toBe(undefined);
	});
});
describe("getYMD()", () => {
	test("getYMD(): Correctly converts date to string", () => {
		expect(getYMD(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(getYMD(new Date("2019-07-27"))).toBe("2019-07-27");
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
	});
	test("getYMD(): Correctly throws on invalid dates", () => {
		expect(() => getYMD(null as unknown as PossibleDate)).toThrow(Error);
		expect(() => getYMD("nope")).toThrow(Error);
		expect(() => getYMD(new Date(Infinity))).toThrow(Error);
		expect(() => getYMD(new Date("nope"))).toThrow(Error);
	});
});
