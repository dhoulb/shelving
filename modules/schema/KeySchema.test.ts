import { InvalidFeedback, KeySchema } from "..";

// Tests.
describe("KeySchema", () => {
	test("TypeScript", () => {
		const s1: KeySchema = KeySchema.OPTIONAL;
		const r1: string = s1.validate("ABC");

		const s2: KeySchema = KeySchema.REQUIRED;
		const r2: string = s2.validate("ABC");

		const s3: KeySchema = KeySchema.create({});
		const r3: string = s3.validate("ABC");
		const s4: KeySchema = KeySchema.create({ required: true });
		const r4: string = s4.validate("ABC");
		const s5: KeySchema = KeySchema.create({ required: false });
		const r5: string = s5.validate("ABC");
		const s6: KeySchema = KeySchema.create({});
		const r6: string = s6.validate("ABC");
	});
	test("Constructs correctly", () => {
		const schema1 = KeySchema.create({});
		expect(schema1).toBeInstanceOf(KeySchema);
		expect(schema1.required).toBe(false);
		const schema2 = KeySchema.REQUIRED;
		expect(schema2).toBeInstanceOf(KeySchema);
		expect(schema2.required).toBe(true);
		const schema3 = KeySchema.REQUIRED;
		expect(schema3).toBeInstanceOf(KeySchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = KeySchema.create({});
		test("Valid keys pass through unchanged", () => {
			expect(schema.validate("abc")).toBe("abc");
			expect(schema.validate("aaaaaaaa")).toBe("aaaaaaaa");
			expect(schema.validate("12345678")).toBe("12345678");
			expect(schema.validate("54495ad94c934721ede76d90")).toBe("54495ad94c934721ede76d90");
		});
		test("Other types are converted to strings", () => {
			expect(schema.validate(0)).toBe("0");
			expect(schema.validate(1234)).toBe("1234");
		});
		test("Falsy values return empty string", () => {
			expect(schema.validate("")).toBe("");
			expect(schema.validate(null)).toBe("");
			expect(schema.validate(undefined)).toBe("");
			expect(schema.validate(false)).toBe("");
		});
		test("Non-strings are Invalid", () => {
			expect(() => schema.validate([])).toThrow(InvalidFeedback);
			expect(() => schema.validate({})).toThrow(InvalidFeedback);
			expect(() => schema.validate(true)).toThrow(InvalidFeedback);
		});
	});
	describe("options.REQUIRED", () => {
		test("Null is a valid value as long as the field is not required (means no ID given)", () => {
			const schema = KeySchema.create({});
			expect(schema.validate(null)).toBe("");
		});
		test("Required empty keys return Required", () => {
			const schema = KeySchema.create({ required: true });
			expect(schema.validate("aaaaaaaaa")).toBe("aaaaaaaaa");
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			expect(() => schema.validate("")).toThrow(InvalidFeedback);
		});
		test("Non-required empty keys do not return Required", () => {
			const schema = KeySchema.create({ required: false });
			expect(schema.validate(null)).toBe("");
		});
	});
	describe("options.value", () => {
		test("Undefined returns empty string", () => {
			const schema = KeySchema.create({});
			expect(schema.validate(undefined)).toBe("");
		});
		test("Undefined with value returns value", () => {
			const schema = KeySchema.create({ value: "abc" });
			expect(schema.validate(undefined)).toBe("abc");
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = KeySchema.create({
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate("a");
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
