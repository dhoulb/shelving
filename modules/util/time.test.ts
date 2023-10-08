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
	expect(getOptionalTime("")).toBe(undefined);
	expect(getOptionalTime(null)).toBe(undefined);
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
	test("from()", () => {
		// Parse strings.
		expect(Time.from("18:19")).toBeInstanceOf(Time);
		expect(Time.from("18:19")).toMatchObject({ h: 18, m: 19, s: 0, ms: 0 });
		expect(Time.from("18:19:20")).toBeInstanceOf(Time);
		expect(Time.from("18:19:20")).toMatchObject({ h: 18, m: 19, s: 20, ms: 0 });
		expect(Time.from("18:19:20.123")).toBeInstanceOf(Time);
		expect(Time.from("18:19:20.123")).toMatchObject({ h: 18, m: 19, s: 20, ms: 123 });

		// Parse dates.
		expect(Time.from(new Date("2020-01-01 18:19:20.123"))).toBeInstanceOf(Time);
		expect(Time.from(new Date("2020-01-01 18:19:20.123"))).toMatchObject({ h: 18, m: 19, s: 20, ms: 123 });
		expect(Time.from("2020-01-01 18:19:20.123")).toBeInstanceOf(Time);
		expect(Time.from("2020-01-01 18:19:20.123")).toMatchObject({ h: 18, m: 19, s: 20, ms: 123 });
		expect(Time.from("now")).toBeInstanceOf(Time);
		expect(Time.from("today")).toBeInstanceOf(Time);
		expect(Time.from("tomorrow")).toBeInstanceOf(Time);
		expect(Time.from("yesterday")).toBeInstanceOf(Time);
		expect(Time.from(Date.now())).toBeInstanceOf(Time);

		// Parse misc times.
		expect(Time.from()).toBeInstanceOf(Time);
		expect(Time.from("now")).toBeInstanceOf(Time);
		expect(Time.from("today")).toBeInstanceOf(Time);
		expect(Time.from("yesterday")).toBeInstanceOf(Time);
		expect(Time.from("tomorrow")).toBeInstanceOf(Time);

		// Parse misc undefined.
		expect(Time.from("")).toBe(undefined);
		expect(Time.from(null)).toBe(undefined);
	});
	test(".h, .m. .s, .ms", () => {
		expect(Time.from("18:19:20.123")?.h).toBe(18);
		expect(Time.from("18:19:20.123")?.m).toBe(19);
		expect(Time.from("18:19:20.123")?.s).toBe(20);
		expect(Time.from("18:19:20.123")?.ms).toBe(123);
	});
	test(".iso", () => {
		expect(getTime("18:19").long).toBe("18:19:00.000");
		expect(getTime("18:19:20").long).toBe("18:19:20.000");
		expect(getTime("18:19:20.123").long).toBe("18:19:20.123");
	});
});
