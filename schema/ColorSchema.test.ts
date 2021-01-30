import { InvalidFeedback } from "shelving/feedback";
import { color, ColorSchema } from ".";

// Tests.
describe("ColorSchema", () => {
	test("TypeScript", () => {
		// Test color.optional
		const s1: ColorSchema<string> = color.optional;
		const r1: string = s1.validate("#FFCC00");

		// Test color.required
		const s2: ColorSchema<string> = color.required;
		const r2: string = s2.validate("#FFCC00");

		// Test color({})
		const s3: ColorSchema<string> = color({});
		const r3: string = s3.validate("#FFCC00");
		const s4: ColorSchema<string> = color({ required: true });
		const r4: string = s4.validate("#FFCC00");
		const s5: ColorSchema<string> = color({ required: false });
		const r5: string = s5.validate("#FFCC00");
		const s6: ColorSchema<string> = color({});
		const r6: string = s6.validate("#FFCC00");

		// Test options.
		const s9: ColorSchema<"#00CCFF"> = color({ options: ["#00CCFF"], required: true });
		const s10: ColorSchema<"#00CCFF" | ""> = color({ options: ["#00CCFF"] });
		const s11: ColorSchema<"#00CCFF"> = color({ options: { "#00CCFF": "ABC" }, required: true });
		const s12: ColorSchema<"#00CCFF" | ""> = color({ options: { "#00CCFF": "ABC" } });
		// @ts-expect-error Type cannot be a subset of `string` unless `options` key is set.
		const s13: ColorSchema<"#00CCFF"> = color({ required: true });
		// @ts-expect-error Type cannot be a subset of `string` unless `options` key is set.
		const s14: ColorSchema<"#00CCFF" | ""> = color({ required: false });
	});
	test("Constructs correctly", () => {
		const schema1 = color({});
		expect(schema1).toBeInstanceOf(ColorSchema);
		expect(schema1.required).toBe(false);
		const schema2 = color.required;
		expect(schema2).toBeInstanceOf(ColorSchema);
		expect(schema2.required).toBe(true);
		const schema3 = color.required;
		expect(schema3).toBeInstanceOf(ColorSchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = color({});
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
		test("String with no valid characters is empty string", () => {
			expect(schema.validate("zzz")).toBe("");
		});
		test("Nullish values return empty string", () => {
			expect(schema.validate("")).toBe("");
			expect(schema.validate(null)).toBe("");
			expect(schema.validate(undefined)).toBe("");
			expect(schema.validate(false)).toBe("");
		});
		test("Invalid phone numbers are invalid", () => {
			expect(() => schema.validate("zzzzzzz000")).toThrow(InvalidFeedback);
			expect(() => schema.validate("123")).toThrow(InvalidFeedback);
		});
		test("Non-strings are Invalid", () => {
			expect(() => schema.validate([])).toThrow(InvalidFeedback);
			expect(() => schema.validate({})).toThrow(InvalidFeedback);
			expect(() => schema.validate(true)).toThrow(InvalidFeedback);
		});
	});
	describe("options.value", () => {
		test("Undefined returns default default value (empty string)", () => {
			const schema = color({});
			expect(schema.validate(undefined)).toBe("");
		});
		test("Undefined with default value returns default value", () => {
			const schema = color({ value: "#00CCFF" });
			expect(schema.validate(undefined)).toBe("#00CCFF");
		});
	});
	describe("options.required", () => {
		test("Non-required value allows empty string", () => {
			const schema = color({ required: false });
			expect(schema.validate(null)).toBe("");
			expect(schema.validate("")).toBe("");
			expect(schema.validate(false)).toBe("");
		});
		test("Required value disallows null", () => {
			const schema = color({ required: true });
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			expect(() => schema.validate("")).toThrow(InvalidFeedback);
			expect(() => schema.validate(false)).toThrow(InvalidFeedback);
		});
	});
});
