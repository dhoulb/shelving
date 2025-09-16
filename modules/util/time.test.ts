import { describe, expect, test } from "bun:test";
import { Time, ValueError, getTime, requireTime } from "../index.js";

test("getTime()", () => {
	// Parsed as dates.
	expect(getTime("now")).toBeInstanceOf(Time);
	expect(getTime("today")).toBeInstanceOf(Time);
	expect(getTime("yesterday")).toBeInstanceOf(Time);
	expect(getTime("tomorrow")).toBeInstanceOf(Time);

	// Parsed as string.
	expect(getTime("18:19")).toBeInstanceOf(Time);
	expect(getTime("18:19:20")).toBeInstanceOf(Time);
	expect(getTime("18:19:20.123")).toBeInstanceOf(Time);

	// Not parseable.
	expect<Time | undefined>(getTime(undefined)).toBe(undefined);
	expect<Time | undefined>(getTime("")).toBe(undefined);
	expect<Time | undefined>(getTime(null)).toBe(undefined);
});
test("requireTime()", () => {
	// Parsed as date.
	expect(requireTime(new Date("2022-01-01 18:19:20.123")).long).toBe("18:19:20.123");

	// Parsed as string.
	expect(requireTime("18:19").long).toBe("18:19:00.000");
	expect(requireTime("18:19:20").long).toBe("18:19:20.000");
	expect(requireTime("18:19:20.123").long).toBe("18:19:20.123");

	// Not parseable.
	expect(() => requireTime("")).toThrow(ValueError);
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
		expect(Time.from("now")).toBeInstanceOf(Time);
		expect(Time.from("today")).toBeInstanceOf(Time);
		expect(Time.from("yesterday")).toBeInstanceOf(Time);
		expect(Time.from("tomorrow")).toBeInstanceOf(Time);

		// Parse misc undefined.
		expect<Time | undefined>(Time.from("")).toBe(undefined);
		expect<Time | undefined>(Time.from(undefined)).toBe(undefined);
		expect<Time | undefined>(Time.from(null)).toBe(undefined);
	});
	test(".h, .m. .s, .ms", () => {
		expect(Time.from("18:19:20.123")?.h).toBe(18);
		expect(Time.from("18:19:20.123")?.m).toBe(19);
		expect(Time.from("18:19:20.123")?.s).toBe(20);
		expect(Time.from("18:19:20.123")?.ms).toBe(123);
	});
	test(".long", () => {
		expect(Time.from("18:19")?.long).toBe("18:19:00.000");
		expect(Time.from("18:19:20")?.long).toBe("18:19:20.000");
		expect(Time.from("18:19:20.123")?.long).toBe("18:19:20.123");
	});
});
