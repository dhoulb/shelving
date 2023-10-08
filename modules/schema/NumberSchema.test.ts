import { Feedback, NUMBER, NumberSchema, OPTIONAL_NUMBER, Schema } from "../index.js";

// Tests.
test("TypeScript", () => {
	// Test number.optional
	const s1: Schema<number> = NUMBER;
	const r1: number = s1.validate(123);

	// Test number.required
	const s2: Schema<number | null> = OPTIONAL_NUMBER;
	const r2: number | null = s2.validate(123);

	// Test new({})
	const s3: NumberSchema = new NumberSchema({});
	const r3: number = s3.validate(123);
});
test("constructor()", () => {
	const schema1 = new NumberSchema({});
	expect(schema1).toBeInstanceOf(Schema);
	expect(OPTIONAL_NUMBER).toBeInstanceOf(Schema);
	expect(NUMBER).toBeInstanceOf(Schema);
});
describe("validate()", () => {
	const schema = new NumberSchema({});
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
	});
	test("-0 is normalised to 0", () => {
		expect(Object.is(schema.validate(-0), 0)).toBe(true);
		expect(Object.is(schema.validate(-0), -0)).toBe(false);
	});
	test("Infinity returns invalid", () => {
		expect(() => schema.validate(Infinity)).toThrow(Feedback);
		expect(() => schema.validate(-Infinity)).toThrow(Feedback);
	});
	test("Non-number strings are invalid", () => {
		expect(() => schema.validate("abc")).toThrow(Feedback);
	});
	test("Non-numbers are invalid", () => {
		expect(() => schema.validate(null)).toThrow(Feedback);
		expect(() => schema.validate(true)).toThrow(Feedback);
		expect(() => schema.validate([])).toThrow(Feedback);
		expect(() => schema.validate({})).toThrow(Feedback);
		expect(() => schema.validate(() => {})).toThrow(Feedback);
	});
});
describe("options.value", () => {
	test("Default value is 0", () => {
		const schema = new NumberSchema({});
		expect(schema.value).toBe(0);
		expect(schema.validate(undefined)).toBe(0);
	});
	test("Default value is applied correctly", () => {
		const schema = new NumberSchema({ value: 1234 });
		expect(schema.value).toBe(1234);
		expect(schema.validate(undefined)).toBe(1234);
	});
});
describe("options.min", () => {
	test("Defaults to -Infinity", () => {
		const schema = new NumberSchema({});
		expect(schema.min).toBe(-Infinity);
	});
	test("Min is checked correctly", () => {
		const schema = new NumberSchema({ min: 100 });
		expect(schema.min).toBe(100);
		expect(() => schema.validate(99)).toThrow(Feedback);
		expect(schema.validate(100)).toBe(100);
	});
});
describe("options.max", () => {
	test("Defaults to Infinity", () => {
		const schema = new NumberSchema({});
		expect(schema.max).toBe(Infinity);
	});
	test("Max is checked correctly", () => {
		const schema = new NumberSchema({ max: 100 });
		expect(schema.max).toBe(100);
		expect(() => schema.validate(101)).toThrow(Feedback);
		expect(schema.validate(100)).toBe(100);
	});
});
describe("options.step", () => {
	test("Defaults to undefined", () => {
		const schema = new NumberSchema({});
		expect(schema.step).toBe(undefined);
	});
	test("Numbers with step are rounded correctly", () => {
		const schema1 = new NumberSchema({ step: 1 });
		expect(schema1.validate(1001)).toBe(1001);
		expect(schema1.validate(100.0)).toBe(100);
		const schema2 = new NumberSchema({ step: 0.001 });
		expect(schema2.validate(100.001)).toBe(100.001);
		expect(schema2.validate(100.001)).not.toBe(100);
		const schema3 = new NumberSchema({ step: 100 });
		expect(schema3.validate(51)).toBe(100);
		expect(schema3.validate(149)).toBe(100);
	});
});
