import type { Schema } from "../index.js";
import { COLOR, ColorSchema, Feedback, OPTIONAL_COLOR } from "../index.js";

// Tests.
test("TypeScript", () => {
	const s1: Schema<string | null> = OPTIONAL_COLOR;
	const r1: string | null = s1.validate("#FFCC00");

	const s2: Schema<string> = COLOR;
	const r2: string = s2.validate("#FFCC00");

	const s3: Schema<string> = new ColorSchema({});
	const r3: string = s3.validate("#FFCC00");
});
test("constructor()", () => {
	const schema1 = new ColorSchema({});
	expect(schema1).toBeInstanceOf(ColorSchema);
	const schema2 = COLOR;
	expect(schema2).toBeInstanceOf(ColorSchema);
	const schema3 = COLOR;
	expect(schema3).toBeInstanceOf(ColorSchema);
});
describe("validate()", () => {
	const schema = new ColorSchema({});
	test("Valid color numbers are valid", () => {
		expect(schema.validate("#000000")).toBe("#000000");
		expect(schema.validate("#00CCFF")).toBe("#00CCFF");
		expect(schema.validate("#FFFFFF")).toBe("#FFFFFF");
	});
	test("Whitespace and other characters are stripped", () => {
		expect(schema.validate("    #000000    ")).toBe("#000000");
		expect(schema.validate("# 0 1 2 3 4 5")).toBe("#012345");
	});
	test("Fixable colors are fixed", () => {
		expect(schema.validate("#abcdef")).toBe("#ABCDEF"); // Capitalised.
		expect(schema.validate("000000")).toBe("#000000"); // Hash is added.
		expect(schema.validate("[[[[skdjf----bwe2923we9djsdinmns dao  sd")).toBe("#DFBE29"); // Invalid characters are stripped.
	});
	test("Invalid colors are invalid", () => {
		expect(() => schema.validate("zzz")).toThrow(Feedback);
		expect(() => schema.validate("")).toThrow(Feedback);
		expect(() => schema.validate("zzzzzzz000")).toThrow(Feedback);
		expect(() => schema.validate("123")).toThrow(Feedback);
	});
	test("Non-strings are invalid", () => {
		expect(() => schema.validate([])).toThrow(Feedback);
		expect(() => schema.validate({})).toThrow(Feedback);
		expect(() => schema.validate(true)).toThrow(Feedback);
		expect(() => schema.validate(null)).toThrow(Feedback);
		expect(() => schema.validate("")).toThrow(Feedback);
		expect(() => schema.validate(false)).toThrow(Feedback);
	});
});
describe("options.value", () => {
	test("Undefined with default value returns default value", () => {
		const schema = new ColorSchema({ value: "#00CCFF" });
		expect(schema.validate(undefined)).toBe("#00CCFF");
	});
});
