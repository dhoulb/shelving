import { InvalidFeedback, BooleanSchema } from "../index.js";

// Tests.
describe("BooleanSchema()", () => {
	test("TypeScript", () => {
		const s1: BooleanSchema<boolean> = BooleanSchema.OPTIONAL;
		const r1: boolean = s1.validate(true);

		const s2: BooleanSchema<true> = BooleanSchema.REQUIRED;
		const r2: true = s2.validate(true);

		const s3: BooleanSchema<boolean> = BooleanSchema.create({});
		const r3: boolean = s3.validate(true);
		const s4: BooleanSchema<true> = BooleanSchema.create({ required: true });
		const r4: true = s4.validate(true);
		const s5: BooleanSchema<boolean> = BooleanSchema.create({ required: false });
		const r5: boolean = s5.validate(true);
		const s6: BooleanSchema<boolean> = BooleanSchema.create({});
		const r6: boolean = s6.validate(true);
	});
	test("Constructs correctly", () => {
		const schema1 = BooleanSchema.create({});
		expect(schema1).toBeInstanceOf(BooleanSchema);
		expect(schema1.required).toBe(false);
		const schema2 = BooleanSchema.REQUIRED;
		expect(schema2).toBeInstanceOf(BooleanSchema);
		expect(schema2.required).toBe(true);
		const schema3 = BooleanSchema.REQUIRED;
		expect(schema3).toBeInstanceOf(BooleanSchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = BooleanSchema.OPTIONAL;
		test("Booleans pass through unchanged", () => {
			expect(schema.validate(true)).toBe(true);
			expect(schema.validate(false)).toBe(false);
		});
		test("Non-booleans are just converted to true or false (following normal Javascript rules)", () => {
			expect(schema.validate("abc")).toBe(true);
			expect(schema.validate(123)).toBe(true);
			expect(schema.validate(0)).toBe(false);
			expect(schema.validate(null)).toBe(false);
			expect(schema.validate([])).toBe(true);
			expect(schema.validate({})).toBe(true);
		});
	});
	describe("options.value", () => {
		test("Works correctly", () => {
			const schema1 = BooleanSchema.create({ value: true });
			expect(schema1.value).toBe(true);
			expect(schema1.validate(undefined)).toEqual(true);
			const schema2 = BooleanSchema.create({ value: false });
			expect(schema2.value).toBe(false);
			expect(schema2.validate(undefined)).toEqual(false);
		});
		test("Defaults to false", () => {
			const schema = BooleanSchema.OPTIONAL;
			expect(schema.value).toBe(false);
			expect(schema.validate(undefined)).toEqual(false);
		});
	});
	describe("options.required", () => {
		test("Works correctly for valid values", () => {
			const schema = BooleanSchema.create({ required: false });
			expect(schema.required).toBe(false);
			expect(schema.validate(0)).toBe(false);
			expect(schema.validate(undefined)).toBe(false);
			expect(schema.validate(false)).toBe(false);
		});
		test("Works correctly for invalid values", () => {
			const schema = BooleanSchema.create({ required: true });
			expect(schema.required).toBe(true);
			expect(() => schema.validate(0)).toThrow(InvalidFeedback);
			expect(() => schema.validate(undefined)).toThrow(InvalidFeedback);
			expect(() => schema.validate(false)).toThrow(InvalidFeedback);
		});
		test("Default required is false", () => {
			const schema = BooleanSchema.OPTIONAL;
			expect(schema.required).toBe(false);
			expect(schema.validate(0)).toBe(false);
			expect(schema.validate(undefined)).toBe(false);
			expect(schema.validate(false)).toBe(false);
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = BooleanSchema.create({
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate(true);
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
