import { getOptionalDate, getYmd, getOptionalYmd } from "../index.js";

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
		expect(getOptionalDate(() => new Date("2019-11-27"))).toBeInstanceOf(Date);
		expect(getOptionalDate(() => new Date())).toBeInstanceOf(Date);
		expect(getOptionalDate(() => "2019-11-27")).toBeInstanceOf(Date);
		expect(getOptionalDate(() => "now")).toBeInstanceOf(Date);
		expect(getOptionalDate(() => "yesterday")).toBeInstanceOf(Date);
		expect(getOptionalDate(() => "today")).toBeInstanceOf(Date);
		expect(getOptionalDate(() => "tomorrow")).toBeInstanceOf(Date);
		expect(getOptionalDate(() => new Date("9999-12-31").getTime())).toBeInstanceOf(Date);
		expect(getOptionalDate(() => 0)).toBeInstanceOf(Date);
		expect(getOptionalDate(() => new Date("0000-01-01").getTime())).toBeInstanceOf(Date);
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
		expect(getOptionalYmd(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(getOptionalYmd(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(getOptionalYmd(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("toYmd(): Correctly converts possible dates to sring", () => {
		expect(getOptionalYmd("2019-11-27")).toBe("2019-11-27");
		expect(getOptionalYmd("0001-01-01")).toBe("0001-01-01");
		expect(getOptionalYmd("9999-12-31")).toBe("9999-12-31");
		expect(getOptionalYmd(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(getOptionalYmd(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(getOptionalYmd(new Date("9999-12-31").getTime())).toBe("9999-12-31");
	});
	test("toYmd(): Correctly converts invalid dates and other things to null", () => {
		expect(getOptionalYmd(null as any)).toBe(null);
		expect(getOptionalYmd("nope")).toBe(null);
		expect(getOptionalYmd(new Date(Infinity))).toBe(null);
		expect(getOptionalYmd(new Date("nope"))).toBe(null);
	});
});
describe("getYmd()", () => {
	test("getYmd(): Correctly converts date to string", () => {
		expect(getYmd(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(getYmd(new Date("2019-07-27"))).toBe("2019-07-27");
		expect(getYmd(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(getYmd(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("getYmd(): Correctly converts possible dates to sring", () => {
		expect(getYmd("2019-11-27")).toBe("2019-11-27");
		expect(getYmd("0001-01-01")).toBe("0001-01-01");
		expect(getYmd("9999-12-31")).toBe("9999-12-31");
		expect(getYmd(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(getYmd(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(getYmd(new Date("9999-12-31").getTime())).toBe("9999-12-31");
	});
	test("getYmd(): Correctly throws on invalid dates", () => {
		expect(() => getYmd(null as any)).toThrow(Error);
		expect(() => getYmd("nope")).toThrow(Error);
		expect(() => getYmd(new Date(Infinity))).toThrow(Error);
		expect(() => getYmd(new Date("nope"))).toThrow(Error);
	});
});
