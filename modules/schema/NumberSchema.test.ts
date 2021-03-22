import { InvalidFeedback, number, NumberSchema } from "..";

// Tests.
describe("NumberSchema", () => {
	test("TypeScript", () => {
		// Test number.optional
		const s1: NumberSchema<number | null> = number.optional;
		const r1: number | null = s1.validate(123);

		// Test number.required
		const s2: NumberSchema<number> = number.required;
		const r2: number = s2.validate(123);

		// Test number({})
		const s3: NumberSchema<number> = number({ required: true });
		const r3: number = s3.validate(123);
		const s4: NumberSchema<number | null> = number({ required: false });
		const r4: number | null = s4.validate(123);
		const s5: NumberSchema<number | null> = number({ required: false });
		const r5: number | null = s5.validate(123);
		const s6: NumberSchema<number | null> = number({});
		const r6: number | null = s6.validate(123);

		// Test options.
		const s9: NumberSchema<123> = number({ options: [123], required: true });
		const s10: NumberSchema<123 | null> = number({ options: [123] });
		const s11: NumberSchema<123> = number({ options: { 123: "ABC" }, required: true });
		const s12: NumberSchema<123 | null> = number({ options: { 123: "ABC" } });
		// @ts-expect-error Type cannot be a subset of `number` unless `options` key is set.
		const s13: NumberSchema<123> = number({ required: true });
		// @ts-expect-error Type cannot be a subset of `number | null` unless `options` key is set.
		const s14: NumberSchema<123 | null> = number({ required: false });
	});
	test("Constructs correctly", () => {
		const schema1 = number({});
		expect(schema1).toBeInstanceOf(NumberSchema);
		expect(schema1.required).toBe(false);
		const schema2 = number.required;
		expect(schema2).toBeInstanceOf(NumberSchema);
		expect(schema2.required).toBe(true);
		const schema3 = number.required;
		expect(schema3).toBeInstanceOf(NumberSchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = number({});
		test("Numbers pass through unchanged", () => {
			expect(schema.validate(1234)).toBe(1234);
			expect(schema.validate(19.99)).toBe(19.99);
		});
		test("Number strings are converted to numbers", () => {
			expect(schema.validate("123")).toBe(123);
			expect(schema.validate("19.99")).toBe(19.99);
		});
		test("Non-numeric characters are stripped from strings to ensure they still convert cleanly", () => {
			expect(schema.validate("$200")).toBe(200);
			expect(schema.validate("200.99p")).toBe(200.99);
			expect(schema.validate("aaaaaa2aaaaaaa0zzzzzzzz0.99p")).toBe(200.99);
			expect(schema.validate("aaaaaa2aaaaaaa0zzzzzzzz0.....99p")).toBe(200.99);
		});

		test("Falsy values return null", () => {
			expect(schema.validate(null)).toBe(null);
			expect(schema.validate("")).toBe(null);
			expect(schema.validate(NaN)).toEqual(null);
			expect(schema.validate(NaN)).toEqual(null);
		});
		test("Infinity returns invalid", () => {
			expect(() => schema.validate(Infinity)).toThrow(InvalidFeedback);
			expect(() => schema.validate(-Infinity)).toThrow(InvalidFeedback);
		});
		test("Non-number strings are invalid", () => {
			expect(() => schema.validate("abc")).toThrow(InvalidFeedback);
		});
		test("Non-numbers are invalid", () => {
			expect(() => schema.validate(true)).toThrow(InvalidFeedback);
			expect(() => schema.validate([])).toThrow(InvalidFeedback);
			expect(() => schema.validate({})).toThrow(InvalidFeedback);
			expect(() => schema.validate(() => {})).toThrow(InvalidFeedback);
		});
	});
	describe("options.value", () => {
		test("Default value is null", () => {
			const schema = number({});
			expect(schema.value).toBe(null);
			expect(schema.validate(undefined)).toBe(null);
		});
		test("Default value is applied correctly", () => {
			const schema = number({ value: 1234 });
			expect(schema.value).toBe(1234);
			expect(schema.validate(undefined)).toBe(1234);
		});
	});
	describe("options.required", () => {
		test("Defaults to not required", () => {
			const schema = number({});
			expect(schema.required).toBe(false);
			expect(schema.validate(null)).toBe(null);
			expect(schema.validate("")).toBe(null);
		});
		test("Non-required value allows null", () => {
			const schema = number({ required: false });
			expect(schema.required).toBe(false);
			expect(schema.validate(null)).toBe(null);
			expect(schema.validate("")).toBe(null);
		});
		test("Required value disallows null", () => {
			const schema = number({ required: true });
			expect(schema.required).toBe(true);
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			expect(() => schema.validate("")).toThrow(InvalidFeedback);
		});
	});
	describe("options.min", () => {
		test("Defaults to null", () => {
			const schema = number({});
			expect(schema.min).toBe(null);
		});
		test("Min is checked correctly", () => {
			const schema = number({ min: 100 });
			expect(schema.min).toBe(100);
			expect(() => schema.validate(99)).toThrow(InvalidFeedback);
			expect(schema.validate(100)).toBe(100);
		});
	});
	describe("options.max", () => {
		test("Defaults to null", () => {
			const schema = number({});
			expect(schema.max).toBe(null);
		});
		test("Max is checked correctly", () => {
			const schema = number({ max: 100 });
			expect(schema.max).toBe(100);
			expect(() => schema.validate(101)).toThrow(InvalidFeedback);
			expect(schema.validate(100)).toBe(100);
		});
	});
	describe("options.step", () => {
		test("Defaults to null", () => {
			const schema = number({});
			expect(schema.step).toBe(null);
		});
		test("Numbers with step are rounded correctly", () => {
			const schema1 = number({ step: 1 });
			expect(schema1.validate(1001)).toBe(1001);
			expect(schema1.validate(100.0)).toBe(100);
			const schema2 = number({ step: 0.001 });
			expect(schema2.validate(100.001)).toBe(100.001);
			expect(schema2.validate(100.001)).not.toBe(100);
			const schema3 = number({ step: 100 });
			expect(schema3.validate(51)).toBe(100);
			expect(schema3.validate(149)).toBe(100);
		});
	});
	describe("options.options", () => {
		test("Any value is allowed by default", () => {
			const schema = number({});
			expect(schema.validate(123)).toBe(123);
		});
		test("Value is allowed if it exists in options", () => {
			const schema = number({ options: [1, 2, 3] });
			expect(schema.validate(1)).toBe(1);
		});
		test("Invalid if value doesn't exist in options", () => {
			const schema = number({ options: [1, 2, 3] });
			expect(() => schema.validate(4)).toThrow(InvalidFeedback);
		});
		test("Value is allowed if it exists in object options", () => {
			const schema = number({ options: { "1": "A", "2": "B", "3": "C" } });
			expect(schema.validate(2)).toBe(2);
		});
		test("Invalid if value doesn't exist in object options", () => {
			const schema = number({ options: { "1": "A", "2": "B", "3": "C" } });
			expect(() => schema.validate(4)).toThrow(InvalidFeedback);
		});
	});
	describe("options.unit", () => {
		const schema = number({ unit: "meter" });
		test("Numbers pass through unchanged", () => {
			expect(schema.validate(1234)).toBe(1234);
			expect(schema.validate(19.99)).toBe(19.99);
		});
		test("Number strings are converted to numbers", () => {
			expect(schema.validate("123")).toBe(123);
			expect(schema.validate("19.99")).toBe(19.99);
		});
		test("Base units are parsed correctly", () => {
			expect(schema.validate("200m")).toBe(200);
			expect(schema.validate("200 m")).toBe(200);
			expect(schema.validate("200.99metres")).toBe(200.99);
			expect(schema.validate("200.99 metres")).toBe(200.99);
			expect(schema.validate("123,456 m")).toBe(123456);
			expect(number({ unit: "foot" }).validate("200ft")).toBe(200);
			expect(number({ unit: "foot" }).validate("200 ft")).toBe(200);
			expect(number({ unit: "foot" }).validate("200.99feet")).toBe(200.99);
			expect(number({ unit: "foot" }).validate("200.99foot")).toBe(200.99);
			expect(number({ unit: "foot" }).validate("200.99 foot")).toBe(200.99);
			expect(number({ unit: "foot" }).validate("123,456 foot")).toBe(123456);
		});
		test("Other units are parsed correctly as base units", () => {
			expect(number({ unit: "foot" }).validate("1yd")).toBe(3);
			expect(number({ unit: "meter" }).validate("1km")).toBe(1000);
			expect(number({ unit: "meter" }).validate("2ft")).toBe(0.6096);
			expect(number({ unit: "meter" }).validate("2000ft")).toBe(609.6);
			expect(number({ unit: "inch" }).validate("100 mi")).toBe(6336000);
			expect(number({ unit: "millimeter" }).validate("1cm")).toBe(10);
			expect(number({ unit: "millimeter" }).validate("1m")).toBe(1000);
			expect(number({ unit: "millimeter" }).validate("1km")).toBe(1000000);
			expect(number({ unit: "centimeter" }).validate("1m")).toBe(100);
			expect(number({ unit: "centimeter" }).validate("1km")).toBe(100000);
		});
		test("Unknown formats are invalid", () => {
			expect(() => schema.validate("200xyz")).toThrow(InvalidFeedback);
			expect(() => schema.validate("200x")).toThrow(InvalidFeedback);
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = number({
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate(123);
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
