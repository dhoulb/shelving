import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { DATE, DateSchema, Feedback, NULLABLE_DATE, requireDateString } from "../index.js";

// Tests.
test("TypeScript", () => {
	const s1: Schema<string | null> = NULLABLE_DATE;
	const r1: string | null = s1.validate("2015-09-12");

	const s2: Schema<string> = DATE;
	const r2: string = s2.validate("2015-09-12");

	const s3: Schema<string | null> = new DateSchema({});
	const r3: string | null = s3.validate("2015-09-12");
	const s4: Schema<string> = new DateSchema({});
	const r4: string = s4.validate("2015-09-12");
	const s5: Schema<string | null> = new DateSchema({});
	const r5: string | null = s5.validate("2015-09-12");
	const s6: Schema<string | null> = new DateSchema({});
	const r6: string | null = s6.validate("2015-09-12");
});
test("constructor()", () => {
	const schema1 = new DateSchema({});
	expect(schema1).toBeInstanceOf(DateSchema);
	const schema2 = DATE;
	expect(schema2).toBeInstanceOf(DateSchema);
	const schema3 = DATE;
	expect(schema3).toBeInstanceOf(DateSchema);
});
describe("validate()", () => {
	const schema = new DateSchema({});
	test("Date instances are converted to strings", () => {
		const d1 = new Date("2018-08-09");
		expect(schema.validate(d1)).toBe("2018-08-09");
		const d2 = new Date(0);
		expect(schema.validate(d2)).toBe("1970-01-01");
		const d3 = new Date("1998");
		expect(schema.validate(d3)).toBe("1998-01-01");
	});
	test("Strings are converted to YMD date strings", () => {
		expect(schema.validate("    1995-12-17    ")).toBe("1995-12-17");
		expect(schema.validate("1995-12-17T03:24:00")).toBe("1995-12-17");
		expect(schema.validate("December 17, 1995 03:24:00")).toBe("1995-12-17");
		expect(schema.validate("1995-11-18")).toBe("1995-11-18");
	});
	test("Invalid strings are invalid", () => {
		expect(() => schema.validate("abc")).toThrow(Feedback);
		expect(() => schema.validate("7 1995")).toThrow(Feedback);
	});
	test("Numbers are converted to YMD date strings", () => {
		expect(schema.validate(0)).toEqual("1970-01-01");
		expect(schema.validate(1530586357000)).toEqual("2018-07-03");
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
		const schema = new DateSchema({});
		expect(schema.validate(undefined)).toBe(requireDateString(new Date()));
	});
	test("Undefined with default value returns default value", () => {
		const schema1 = new DateSchema({ value: "1995" });
		expect(schema1.validate(undefined)).toEqual("1995-01-01");
		const schema2 = new DateSchema({ value: 1530586357000 });
		expect(schema2.validate(undefined)).toEqual("2018-07-03");
		const schema3 = new DateSchema({ value: new Date("1995") });
		expect(schema3.validate(undefined)).toEqual("1995-01-01");
	});
});
describe("options.min", () => {
	test("Date outside minimum is invalid", () => {
		const schema1 = new DateSchema({ min: new Date("2016") });
		expect(schema1.validate("2016")).toBe("2016-01-01");
		expect(() => schema1.validate("2015")).toThrow(Feedback);
		const schema2 = new DateSchema({ min: "2016-01-01" });
		expect(schema2.validate("2016")).toBe("2016-01-01");
		expect(() => schema2.validate("2015")).toThrow(Feedback);
		const schema3 = new DateSchema({ min: new Date(1530586357001) });
		expect(schema3.validate(1530586357001)).toBe("2018-07-03");
		expect(() => schema3.validate(1530586357000)).toThrow(Feedback);
	});
});
describe("options.max", () => {
	test("Date outside maximum is invalid", () => {
		const schema1 = new DateSchema({ max: new Date("2016") });
		expect(schema1.validate("2016")).toBe("2016-01-01");
		expect(() => schema1.validate("2017")).toThrow(Feedback);
		const schema2 = new DateSchema({ max: new Date(1530586357000) });
		expect(schema2.validate(1530586357000)).toBe("2018-07-03");
		expect(() => schema2.validate(1530586357001)).toThrow(Feedback);
	});
});
describe("options.input", () => {
	test("Should be date", () => {
		const schema1 = new DateSchema({});
		expect(schema1.input).toBe("date");
		const schema2 = DATE;
		expect(schema2.input).toBe("date");
	});
});
describe("options.step", () => {
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    test("Rounds date to the nearest step interval", () => {
        const schema = new DateSchema({ step: DAY_IN_MS });
        expect(schema.validate("2025-01-15T11:59:59Z")).toBe("2025-01-15");
        expect(schema.validate("2025-01-15T12:00:01Z")).toBe("2025-01-16");
        expect(schema.validate("2025-01-15T12:00:00Z")).toBe("2025-01-16");
        expect(schema.validate("2025-01-15T00:00:00Z")).toBe("2025-01-15");
    });
    test("Rounded value is checked against min/max constraints", () => {
        const schema = new DateSchema({
            step: DAY_IN_MS,
            min: "2025-01-15",
            max: "2025-01-16",
        });
        expect(schema.validate("2025-01-14T20:00:00Z")).toBe("2025-01-15");
        expect(() => schema.validate("2025-01-14T08:00:00Z")).toThrow(Feedback);
        expect(schema.validate("2025-01-16T08:00:00Z")).toBe("2025-01-16");
        expect(() => schema.validate("2025-01-16T14:00:00Z")).toThrow(Feedback);
    });
});