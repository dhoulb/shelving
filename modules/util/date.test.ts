import type { PossibleDate } from "../index.js";
import { getOptionalDate, getOptionalYMD, getYMD } from "../index.js";

describe("toDate()", () => {
	test("toDate(): Parses valid possible dates to Date instances", () => {
		expect(getOptionalDate(undefined)).toBeInstanceOf(Date);
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
	test("toDate(): Parses invalid values to null", () => {
		expect(getOptionalDate(null)).toBe(null);
		expect(getOptionalDate("")).toBe(null);
		expect(getOptionalDate(true)).toBe(null);
		expect(getOptionalDate(false)).toBe(null);
		expect(getOptionalDate(new Date(""))).toBe(null);
		expect(getOptionalDate(() => null)).toBe(null);
		expect(getOptionalDate(() => "")).toBe(null);
		expect(getOptionalDate(() => true)).toBe(null);
		expect(getOptionalDate(() => false)).toBe(null);
		expect(getOptionalDate(() => new Date(""))).toBe(null);
	});
});
describe("toYmd()", () => {
	test("toYmd(): Correctly converts date to string", () => {
		expect(getOptionalYMD(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(getOptionalYMD(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(getOptionalYMD(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("toYmd(): Correctly converts possible dates to sring", () => {
		expect(getOptionalYMD("2019-11-27")).toBe("2019-11-27");
		expect(getOptionalYMD("0001-01-01")).toBe("0001-01-01");
		expect(getOptionalYMD("9999-12-31")).toBe("9999-12-31");
		expect(getOptionalYMD(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(getOptionalYMD(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(getOptionalYMD(new Date("9999-12-31").getTime())).toBe("9999-12-31");
	});
	test("toYmd(): Correctly converts invalid dates and other things to null", () => {
		expect(getOptionalYMD(null as any)).toBe(null);
		expect(getOptionalYMD("nope")).toBe(null);
		expect(getOptionalYMD(new Date(Infinity))).toBe(null);
		expect(getOptionalYMD(new Date("nope"))).toBe(null);
	});
});
describe("getYmd()", () => {
	test("getYmd(): Correctly converts date to string", () => {
		expect(getYMD(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(getYMD(new Date("2019-07-27"))).toBe("2019-07-27");
		expect(getYMD(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(getYMD(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("getYmd(): Correctly converts possible dates to sring", () => {
		expect(getYMD("2019-11-27")).toBe("2019-11-27");
		expect(getYMD("0001-01-01")).toBe("0001-01-01");
		expect(getYMD("9999-12-31")).toBe("9999-12-31");
		expect(getYMD(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(getYMD(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(getYMD(new Date("9999-12-31").getTime())).toBe("9999-12-31");
	});
	test("getYmd(): Correctly throws on invalid dates", () => {
		expect(() => getYMD(null as unknown as PossibleDate)).toThrow(Error);
		expect(() => getYMD("nope")).toThrow(Error);
		expect(() => getYMD(new Date(Infinity))).toThrow(Error);
		expect(() => getYMD(new Date("nope"))).toThrow(Error);
	});
});
