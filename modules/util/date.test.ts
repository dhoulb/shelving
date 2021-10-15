import { toDate, getYmd, toYmd } from "../index.js";

describe("toDate()", () => {
	test("toDate(): Parses valid possible dates to Date instances", () => {
		expect(toDate(undefined)).toBeInstanceOf(Date);
		expect(toDate(new Date("2019-11-27"))).toBeInstanceOf(Date);
		expect(toDate(new Date())).toBeInstanceOf(Date);
		expect(toDate("2019-11-27")).toBeInstanceOf(Date);
		expect(toDate("now")).toBeInstanceOf(Date);
		expect(toDate("yesterday")).toBeInstanceOf(Date);
		expect(toDate("today")).toBeInstanceOf(Date);
		expect(toDate("tomorrow")).toBeInstanceOf(Date);
		expect(toDate(new Date("9999-12-31").getTime())).toBeInstanceOf(Date);
		expect(toDate(0)).toBeInstanceOf(Date);
		expect(toDate(new Date("0000-01-01").getTime())).toBeInstanceOf(Date);
		expect(toDate(() => new Date("2019-11-27"))).toBeInstanceOf(Date);
		expect(toDate(() => new Date())).toBeInstanceOf(Date);
		expect(toDate(() => "2019-11-27")).toBeInstanceOf(Date);
		expect(toDate(() => "now")).toBeInstanceOf(Date);
		expect(toDate(() => "yesterday")).toBeInstanceOf(Date);
		expect(toDate(() => "today")).toBeInstanceOf(Date);
		expect(toDate(() => "tomorrow")).toBeInstanceOf(Date);
		expect(toDate(() => new Date("9999-12-31").getTime())).toBeInstanceOf(Date);
		expect(toDate(() => 0)).toBeInstanceOf(Date);
		expect(toDate(() => new Date("0000-01-01").getTime())).toBeInstanceOf(Date);
	});
	test("toDate(): Parses invalid values to null", () => {
		expect(toDate(null)).toBe(null);
		expect(toDate("")).toBe(null);
		expect(toDate(true)).toBe(null);
		expect(toDate(false)).toBe(null);
		expect(toDate(new Date(""))).toBe(null);
		expect(toDate(() => null)).toBe(null);
		expect(toDate(() => "")).toBe(null);
		expect(toDate(() => true)).toBe(null);
		expect(toDate(() => false)).toBe(null);
		expect(toDate(() => new Date(""))).toBe(null);
	});
});
describe("toYmd()", () => {
	test("toYmd(): Correctly converts date to string", () => {
		expect(toYmd(new Date("2019-11-27"))).toBe("2019-11-27");
		expect(toYmd(new Date("0001-01-01"))).toBe("0001-01-01");
		expect(toYmd(new Date("9999-12-31"))).toBe("9999-12-31");
	});
	test("toYmd(): Correctly converts possible dates to sring", () => {
		expect(toYmd("2019-11-27")).toBe("2019-11-27");
		expect(toYmd("0001-01-01")).toBe("0001-01-01");
		expect(toYmd("9999-12-31")).toBe("9999-12-31");
		expect(toYmd(new Date("2019-11-27").getTime())).toBe("2019-11-27");
		expect(toYmd(new Date("0001-01-01").getTime())).toBe("0001-01-01");
		expect(toYmd(new Date("9999-12-31").getTime())).toBe("9999-12-31");
	});
	test("toYmd(): Correctly converts invalid dates and other things to null", () => {
		expect(toYmd(null as any)).toBe(null);
		expect(toYmd("nope")).toBe(null);
		expect(toYmd(new Date(Infinity))).toBe(null);
		expect(toYmd(new Date("nope"))).toBe(null);
	});
});
describe("getYmd()", () => {
	test("getYmd(): Correctly converts date to string", () => {
		expect(getYmd(new Date("2019-11-27"))).toBe("2019-11-27");
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
