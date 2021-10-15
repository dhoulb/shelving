import { InvalidFeedback, ColorSchema } from "../index.js";

// Tests.
describe("ColorSchema", () => {
	test("TypeScript", () => {
		const s1: ColorSchema = ColorSchema.OPTIONAL;
		const r1: string = s1.validate("#FFCC00");

		const s2: ColorSchema = ColorSchema.REQUIRED;
		const r2: string = s2.validate("#FFCC00");

		const s3: ColorSchema = ColorSchema.create({});
		const r3: string = s3.validate("#FFCC00");
		const s4: ColorSchema = ColorSchema.create({ required: true });
		const r4: string = s4.validate("#FFCC00");
		const s5: ColorSchema = ColorSchema.create({ required: false });
		const r5: string = s5.validate("#FFCC00");
		const s6: ColorSchema = ColorSchema.create({});
		const r6: string = s6.validate("#FFCC00");
	});
	test("Constructs correctly", () => {
		const schema1 = ColorSchema.create({});
		expect(schema1).toBeInstanceOf(ColorSchema);
		expect(schema1.required).toBe(false);
		const schema2 = ColorSchema.REQUIRED;
		expect(schema2).toBeInstanceOf(ColorSchema);
		expect(schema2.required).toBe(true);
		const schema3 = ColorSchema.REQUIRED;
		expect(schema3).toBeInstanceOf(ColorSchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = ColorSchema.create({});
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
			const schema = ColorSchema.create({});
			expect(schema.validate(undefined)).toBe("");
		});
		test("Undefined with default value returns default value", () => {
			const schema = ColorSchema.create({ value: "#00CCFF" });
			expect(schema.validate(undefined)).toBe("#00CCFF");
		});
	});
	describe("options.required", () => {
		test("Non-required value allows empty string", () => {
			const schema = ColorSchema.create({ required: false });
			expect(schema.validate(null)).toBe("");
			expect(schema.validate("")).toBe("");
			expect(schema.validate(false)).toBe("");
		});
		test("Required value disallows null", () => {
			const schema = ColorSchema.create({ required: true });
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			expect(() => schema.validate("")).toThrow(InvalidFeedback);
			expect(() => schema.validate(false)).toThrow(InvalidFeedback);
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = ColorSchema.create({
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate("#00ccff");
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
