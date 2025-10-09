import { describe, expect, test } from "bun:test";
import { Feedback, TIME, TimeSchema } from "../index.js";

test("constructor()", () => {
	const schema1 = new TimeSchema({});
	expect(schema1).toBeInstanceOf(TimeSchema);
	const schema3 = TIME;
	expect(schema3).toBeInstanceOf(TimeSchema);
});
describe("validate()", () => {
	const schema = new TimeSchema({});
	test("Strings are parsed correctly", () => {
		// Date strings.
		expect(typeof schema.validate("now")).toBe("string");
		expect(schema.validate("today")).toBe("00:00:00");
		expect(schema.validate("20:22")).toBe("20:22:00");
		expect(schema.validate("12:22:23")).toBe("12:22:23");
		expect(schema.validate("2022-12-20 20:22")).toBe("20:22:00");
	});
	test("Numbers are converted to strings", () => {
		expect(typeof schema.validate(1)).toBe("string");
		expect(typeof schema.validate(123)).toBe("string");
		expect(typeof schema.validate(100039384)).toBe("string");
	});
	test("Non-strings (except numbers) throw Invalid", () => {
		expect(() => schema.validate(null)).toThrow(Feedback);
		expect(() => schema.validate(false)).toThrow(Feedback);
		expect(() => schema.validate(true)).toThrow(Feedback);
		expect(() => schema.validate([])).toThrow(Feedback);
		expect(() => schema.validate({})).toThrow(Feedback);
	});
});
describe("options.input", () => {
	test("Should be time", () => {
		const schema1 = new TimeSchema({});
		expect(schema1.input).toBe("time");
		const schema2 = TIME;
		expect(schema2.input).toBe("time");
	});
});
describe("options.min / options.max", () => {
    const schema = new TimeSchema({ min: "09:00", max: "17:00" });
    test("Allows times within the range", () => {
        expect(schema.validate("09:00:00")).toBe("09:00:00");
        expect(schema.validate("12:30:00")).toBe("12:30:00");
        expect(schema.validate("17:00:00")).toBe("17:00:00");
    });
    test("Throws for times outside the range", () => {
        expect(() => schema.validate("08:59:59")).toThrow(Feedback);
        expect(() => schema.validate("17:00:01")).toThrow(Feedback);
    });
});
describe("options.step", () => {
    const MINUTE_IN_MS = 60 * 1000;
    const SECOND_IN_MS = 1000;
    test("Rounds time to the nearest minute", () => {
        const schema = new TimeSchema({ step: MINUTE_IN_MS });
        expect(schema.validate("14:30:29")).toBe("14:30:00");
        expect(schema.validate("14:30:31")).toBe("14:31:00");
        expect(schema.validate("14:30:30")).toBe("14:31:00");
        expect(schema.validate("14:30:00")).toBe("14:30:00");
    });
    test("Rounds time to the nearest second", () => {
        const schema = new TimeSchema({ step: SECOND_IN_MS });
        expect(schema.validate("10:15:30.499")).toBe("10:15:30");
        expect(schema.validate("10:15:30.500")).toBe("10:15:31");
    });
    test("Rounded value is checked against min/max constraints", () => {
        const schema = new TimeSchema({
            step: MINUTE_IN_MS,
            min: "10:00",
            max: "11:00",
        });
        expect(schema.validate("09:59:31")).toBe("10:00:00");
        expect(() => schema.validate("09:59:29")).toThrow(Feedback);
        expect(schema.validate("11:00:29")).toBe("11:00:00");
        expect(() => schema.validate("11:00:31")).toThrow(Feedback);
    });
});
