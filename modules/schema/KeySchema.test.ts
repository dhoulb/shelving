import { InvalidFeedback, schema as shortcuts, KeySchema } from "..";

// Tests.
describe("KeySchema", () => {
	test("TypeScript", () => {
		// Test key.optional
		const s1: KeySchema = shortcuts.key.optional;
		const r1: string = s1.validate("ABC");

		// Test key.required
		const s2: KeySchema = shortcuts.key.required;
		const r2: string = s2.validate("ABC");

		// Test key({})
		const s3: KeySchema = shortcuts.key({});
		const r3: string = s3.validate("ABC");
		const s4: KeySchema = shortcuts.key({ required: true });
		const r4: string = s4.validate("ABC");
		const s5: KeySchema = shortcuts.key({ required: false });
		const r5: string = s5.validate("ABC");
		const s6: KeySchema = shortcuts.key({});
		const r6: string = s6.validate("ABC");
	});
	test("Constructs correctly", () => {
		const schema1 = shortcuts.key({});
		expect(schema1).toBeInstanceOf(KeySchema);
		expect(schema1.required).toBe(false);
		const schema2 = shortcuts.key.required;
		expect(schema2).toBeInstanceOf(KeySchema);
		expect(schema2.required).toBe(true);
		const schema3 = shortcuts.key.required;
		expect(schema3).toBeInstanceOf(KeySchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = shortcuts.key({});
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
	describe("options.required", () => {
		test("Null is a valid value as long as the field is not required (means no ID given)", () => {
			const schema = shortcuts.key({});
			expect(schema.validate(null)).toBe("");
		});
		test("Required empty keys return Required", () => {
			const schema = shortcuts.key({ required: true });
			expect(schema.validate("aaaaaaaaa")).toBe("aaaaaaaaa");
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			expect(() => schema.validate("")).toThrow(InvalidFeedback);
		});
		test("Non-required empty keys do not return Required", () => {
			const schema = shortcuts.key({ required: false });
			expect(schema.validate(null)).toBe("");
		});
	});
	describe("options.value", () => {
		test("Undefined returns empty string", () => {
			const schema = shortcuts.key({});
			expect(schema.validate(undefined)).toBe("");
		});
		test("Undefined with value returns value", () => {
			const schema = shortcuts.key({ value: "abc" });
			expect(schema.validate(undefined)).toBe("abc");
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = shortcuts.key({
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
