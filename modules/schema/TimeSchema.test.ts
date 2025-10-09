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
