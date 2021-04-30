import { InvalidFeedback, schema as shortcuts, PhoneSchema } from "..";

// Tests.
describe("PhoneSchema", () => {
	test("TypeScript", () => {
		// Test phone.optional
		const s1: PhoneSchema = shortcuts.phone.optional;
		const r1: string = s1.validate("+331234567890");

		// Test phone.required
		const s2: PhoneSchema = shortcuts.phone.required;
		const r2: string = s2.validate("+331234567890");

		// Test phone({})
		const s3: PhoneSchema = shortcuts.phone({});
		const r3: string = s3.validate("+331234567890");
		const s4: PhoneSchema = shortcuts.phone({ required: true });
		const r4: string = s4.validate("+331234567890");
		const s5: PhoneSchema = shortcuts.phone({ required: false });
		const r5: string = s5.validate("+331234567890");
		const s6: PhoneSchema = shortcuts.phone({});
		const r6: string = s6.validate("+331234567890");
	});
	test("Constructs correctly", () => {
		const schema1 = shortcuts.phone({});
		expect(schema1).toBeInstanceOf(PhoneSchema);
		expect(schema1.required).toBe(false);
		const schema2 = shortcuts.phone.required;
		expect(schema2).toBeInstanceOf(PhoneSchema);
		expect(schema2.required).toBe(true);
		const schema3 = shortcuts.phone.required;
		expect(schema3).toBeInstanceOf(PhoneSchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = shortcuts.phone({});
		test("Valid phone numbers are valid", () => {
			expect(schema.validate("+441234567890")).toBe("+441234567890");
			expect(schema.validate("+101234567890")).toBe("+101234567890");
		});
		test("Whitespace and other characters are stripped", () => {
			expect(schema.validate("    +441234567890    ")).toBe("+441234567890");
			expect(schema.validate("+1 012 3456 7890")).toBe("+101234567890");
			expect(schema.validate("+1 012-567-8901")).toBe("+10125678901");
		});
		test("Fixable phone numbers are fixed", () => {
			expect(schema.validate("+441+234+56ahshfk7890")).toBe("+441234567890");
			expect(schema.validate("+1 0 1 2 3 4 5 6 7 8 9 0")).toBe("+101234567890");
		});
		test("Non-numeric is empty string", () => {
			expect(schema.validate("abc")).toBe("");
		});
		test("Falsy values return empty string", () => {
			expect(schema.validate("")).toBe("");
			expect(schema.validate(null)).toBe("");
			expect(schema.validate(undefined)).toBe("");
			expect(schema.validate(false)).toBe("");
		});
		test("Invalid phone numbers are invalid", () => {
			expect(() => schema.validate("101234567890")).toThrow(InvalidFeedback);
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
			const schema = shortcuts.phone({});
			expect(schema.validate(undefined)).toBe("");
		});
		test("Undefined with default value returns default value", () => {
			const schema = shortcuts.phone({ value: "+441234567890" });
			expect(schema.validate(undefined)).toBe("+441234567890");
		});
	});
	describe("options.required", () => {
		test("Non-required value allows empty string", () => {
			const schema = shortcuts.phone({ required: false });
			expect(schema.validate(null)).toBe("");
			expect(schema.validate("")).toBe("");
		});
		test("Required value disallows falsy", () => {
			const schema = shortcuts.phone({ required: true });
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			expect(() => schema.validate("")).toThrow(InvalidFeedback);
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = shortcuts.phone({
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate("+331234567890");
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
