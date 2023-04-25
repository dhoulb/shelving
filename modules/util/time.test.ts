import { AssertionError, Time, getOptionalTime, getTime } from "../index.js";

test("getOptionalTime()", () => {
	// Parsed as dates.
	expect(getOptionalTime(undefined)).toBeInstanceOf(Time);
	expect(getOptionalTime("now")).toBeInstanceOf(Time);
	expect(getOptionalTime("today")).toBeInstanceOf(Time);
	expect(getOptionalTime("yesterday")).toBeInstanceOf(Time);
	expect(getOptionalTime("tomorrow")).toBeInstanceOf(Time);

	// Parsed as string.
	expect(getOptionalTime("18:19")).toBeInstanceOf(Time);
	expect(getOptionalTime("18:19:20")).toBeInstanceOf(Time);
	expect(getOptionalTime("18:19:20.123")).toBeInstanceOf(Time);

	// Not parseable.
	expect(getOptionalTime("")).toBe(null);
	expect(getOptionalTime(null)).toBe(null);
});
test("getTime()", () => {
	// Parsed as date.
	expect(getTime(new Date("2022-01-01 18:19:20.123")).long).toBe("18:19:20.123");

	// Parsed as string.
	expect(getTime("18:19").long).toBe("18:19:00.000");
	expect(getTime("18:19:20").long).toBe("18:19:20.000");
	expect(getTime("18:19:20.123").long).toBe("18:19:20.123");

	// Not parseable.
	expect(() => getTime("")).toThrow(AssertionError);
});
describe("Time", () => {
	test("fromString()", () => {
		// Parse strings.
		expect(Time.fromString("18:19")).toBeInstanceOf(Time);
		expect(Time.fromString("18:19")).toMatchObject({ h: 18, m: 19, s: 0, ms: 0 });
		expect(Time.fromString("18:19:20")).toBeInstanceOf(Time);
		expect(Time.fromString("18:19:20")).toMatchObject({ h: 18, m: 19, s: 20, ms: 0 });
		expect(Time.fromString("18:19:20.123")).toBeInstanceOf(Time);
		expect(Time.fromString("18:19:20.123")).toMatchObject({ h: 18, m: 19, s: 20, ms: 123 });
	});
	test("fromDate()", () => {
		// Parse dates.
		expect(Time.fromDate(new Date("2020-01-01 18:19:20.123"))).toBeInstanceOf(Time);
		expect(Time.fromDate(new Date("2020-01-01 18:19:20.123"))).toMatchObject({ h: 18, m: 19, s: 20, ms: 123 });
		expect(Time.fromDate("2020-01-01 18:19:20.123")).toBeInstanceOf(Time);
		expect(Time.fromDate("2020-01-01 18:19:20.123")).toMatchObject({ h: 18, m: 19, s: 20, ms: 123 });
		expect(Time.fromDate("now")).toBeInstanceOf(Time);
		expect(Time.fromDate("today")).toBeInstanceOf(Time);
		expect(Time.fromDate("tomorrow")).toBeInstanceOf(Time);
		expect(Time.fromDate("yesterday")).toBeInstanceOf(Time);
		expect(Time.fromDate(Date.now())).toBeInstanceOf(Time);
	});
	test(".h, .m. .s, .ms", () => {
		expect(Time.fromString("18:19:20.123")?.h).toBe(18);
		expect(Time.fromString("18:19:20.123")?.m).toBe(19);
		expect(Time.fromString("18:19:20.123")?.s).toBe(20);
		expect(Time.fromString("18:19:20.123")?.ms).toBe(123);
	});
	test(".iso", () => {
		expect(getTime("18:19").long).toBe("18:19:00.000");
		expect(getTime("18:19:20").long).toBe("18:19:20.000");
		expect(getTime("18:19:20.123").long).toBe("18:19:20.123");
	});
});
