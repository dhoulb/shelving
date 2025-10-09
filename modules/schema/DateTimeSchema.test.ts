import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { DATETIME, DateTimeSchema, Feedback, NULLABLE_DATETIME } from "../index.js";

// Tests.
test("TypeScript", () => {
	const s1: Schema<string | null> = NULLABLE_DATETIME;
	const r1: string | null = s1.validate("2015-09-12");

	const s2: Schema<string> = DATETIME;
	const r2: string = s2.validate("2015-09-12");

	const s3: Schema<string | null> = new DateTimeSchema({});
	const r3: string | null = s3.validate("2015-09-12");
	const s4: Schema<string> = new DateTimeSchema({});
	const r4: string = s4.validate("2015-09-12");
	const s5: Schema<string | null> = new DateTimeSchema({});
	const r5: string | null = s5.validate("2015-09-12");
	const s6: Schema<string | null> = new DateTimeSchema({});
	const r6: string | null = s6.validate("2015-09-12");
});
test("constructor()", () => {
	const schema1 = new DateTimeSchema({});
	expect(schema1).toBeInstanceOf(DateTimeSchema);
	const schema2 = DATETIME;
	expect(schema2).toBeInstanceOf(DateTimeSchema);
	const schema3 = DATETIME;
	expect(schema3).toBeInstanceOf(DateTimeSchema);
});
describe("validate()", () => {
	const schema = new DateTimeSchema({});
	test("Date instances are converted to strings", () => {
		const d1 = new Date("2018-08-09");
		expect(schema.validate(d1)).toBe("2018-08-09T00:00:00.000Z");
		const d2 = new Date(0);
		expect(schema.validate(d2)).toBe("1970-01-01T00:00:00.000Z");
		const d3 = new Date("1998");
		expect(schema.validate(d3)).toBe("1998-01-01T00:00:00.000Z");
	});
	test("Strings are converted to ISO date strings", () => {
		expect(schema.validate("    1995-12-17    ")).toBe("1995-12-17T00:00:00.000Z");
		expect(schema.validate("1995-12-17T03:24:00")).toBe("1995-12-17T03:24:00.000Z");
		expect(schema.validate("December 17, 1995 03:24:00")).toBe("1995-12-17T03:24:00.000Z");
		expect(schema.validate("1995-11-18")).toBe("1995-11-18T00:00:00.000Z");
	});
	test("Invalid strings are invalid", () => {
		expect(() => schema.validate("abc")).toThrow(Feedback);
		expect(() => schema.validate("7 1995")).toThrow(Feedback);
	});
	test("Numbers are converted to ISO date strings", () => {
		expect(schema.validate(0)).toEqual("1970-01-01T00:00:00.000Z");
		expect(schema.validate(1530586357000)).toEqual("2018-07-03T02:52:37.000Z");
	});
	test("Infinite numbers are invalid", () => {
		expect(() => schema.validate(Number.POSITIVE_INFINITY)).toThrow(Feedback);
		expect(() => schema.validate(Number.NEGATIVE_INFINITY)).toThrow(Feedback);
	});
	test("Invalid values are invalid", () => {
		expect(() => schema.validate(true)).toThrow(Feedback);
		expect(() => schema.validate(false)).toThrow(Feedback);
		expect(() => schema.validate(null)).toThrow(Feedback);
		expect(() => schema.validate("")).toThrow(Feedback);
	});
});
describe("options.value", () => {
	test("Default value is now", () => {
		const schema = new DateTimeSchema({});
		expect(schema.validate(undefined)).toBe(new Date().toISOString());
	});
	test("Undefined with default value returns default value", () => {
		const schema1 = new DateTimeSchema({ value: "1995" });
		expect(schema1.validate(undefined)).toEqual("1995-01-01T00:00:00.000Z");
		const schema2 = new DateTimeSchema({ value: 1530586357000 });
		expect(schema2.validate(undefined)).toEqual("2018-07-03T02:52:37.000Z");
		const schema3 = new DateTimeSchema({ value: new Date("1995") });
		expect(schema3.validate(undefined)).toEqual("1995-01-01T00:00:00.000Z");
	});
});
describe("options.min", () => {
	test("Date outside minimum is invalid", () => {
		const schema1 = new DateTimeSchema({ min: new Date("2016") });
		expect(schema1.validate("2016")).toBe("2016-01-01T00:00:00.000Z");
		expect(() => schema1.validate("2015")).toThrow(Feedback);
		const schema2 = new DateTimeSchema({ min: "2016-01-01" });
		expect(schema2.validate("2016")).toBe("2016-01-01T00:00:00.000Z");
		expect(() => schema2.validate("2015")).toThrow(Feedback);
		const schema3 = new DateTimeSchema({ min: new Date(1530586357000) });
		expect(schema3.validate(1530586357000)).toBe("2018-07-03T02:52:37.000Z");
		expect(() => schema3.validate(1530586356999)).toThrow(Feedback);
	});
});
describe("options.max", () => {
	test("Date outside maximum is invalid", () => {
		const schema1 = new DateTimeSchema({ max: new Date("2016") });
		expect(schema1.validate("2016")).toBe("2016-01-01T00:00:00.000Z");
		expect(() => schema1.validate("2017")).toThrow(Feedback);
		const schema2 = new DateTimeSchema({ max: new Date(1530586357000) });
		expect(schema2.validate(1530586357000)).toBe("2018-07-03T02:52:37.000Z");
		expect(() => schema2.validate(1530586357001)).toThrow(Feedback);
		const schema3 = new DateTimeSchema({ max: new Date(1530586357000) });
		expect(schema3.validate(1530586357000)).toBe("2018-07-03T02:52:37.000Z");
		expect(() => schema3.validate(1530586357001)).toThrow(Feedback);
	});
});
describe("options.step", () => {
    const MINUTE_IN_MS = 60 * 1000;
    const FIFTEEN_MINUTES_IN_MS = 15 * MINUTE_IN_MS;
    test("Rounds datetime to the nearest 15 minutes", () => {
        const schema = new DateTimeSchema({ step: FIFTEEN_MINUTES_IN_MS });
        expect(schema.validate("2025-10-09T13:37:29.000Z")).toBe("2025-10-09T13:30:00.000Z");
        expect(schema.validate("2025-10-09T13:37:31.000Z")).toBe("2025-10-09T13:45:00.000Z");
        expect(schema.validate("2025-10-09T13:37:30.000Z")).toBe("2025-10-09T13:45:00.000Z");
        expect(schema.validate("2025-10-09T14:00:00.000Z")).toBe("2025-10-09T14:00:00.000Z");
    });
    test("Rounded value is checked against min/max constraints", () => {
        const schema = new DateTimeSchema({
            step: FIFTEEN_MINUTES_IN_MS,
            min: "2025-10-09T14:00:00.000Z",
            max: "2025-10-09T14:15:00.000Z",
        });
        expect(schema.validate("2025-10-09T13:52:31.000Z")).toBe("2025-10-09T14:00:00.000Z");
        expect(() => schema.validate("2025-10-09T13:52:29.000Z")).toThrow(Feedback);
        expect(schema.validate("2025-10-09T14:22:29.000Z")).toBe("2025-10-09T14:15:00.000Z");
        expect(() => schema.validate("2025-10-09T14:22:31.000Z")).toThrow(Feedback);
    });
});
describe("options.input", () => {
	test("Should be date", () => {
		const schema1 = new DateTimeSchema({});
		expect(schema1.input).toBe("datetime-local");
		const schema2 = DATETIME;
		expect(schema2.input).toBe("datetime-local");
	});
});
