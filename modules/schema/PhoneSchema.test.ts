import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { NULLABLE_PHONE, PHONE, PhoneSchema } from "../index.js";

// Tests.
test("TypeScript", () => {
	// Test phone.optional
	const s1: Schema<string | null> = NULLABLE_PHONE;
	const r1: string | null = s1.validate("+331234567890");

	// Test phone.required
	const s2: Schema<string> = PHONE;
	const r2: string = s2.validate("+331234567890");

	// Test phone({})
	const s3: Schema<string> = new PhoneSchema({});
	const r3: string = s3.validate("+331234567890");
});
test("constructor()", () => {
	const schema1 = new PhoneSchema({});
	expect(schema1).toBeInstanceOf(PhoneSchema);
	const schema2 = PHONE;
	expect(schema2).toBeInstanceOf(PhoneSchema);
	const schema3 = PHONE;
	expect(schema3).toBeInstanceOf(PhoneSchema);
});
describe("validate()", () => {
	const schema = new PhoneSchema({});
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
	test("Non-numeric are invalid", () => {
		expect(() => schema.validate("abc")).toThrow();
	});
	test("Invalid phone numbers are invalid", () => {
		expect(() => schema.validate("101234567890")).toThrow();
		expect(() => schema.validate("123")).toThrow();
	});
	test("Non-strings are invalid", () => {
		expect(() => schema.validate([])).toThrow();
		expect(() => schema.validate({})).toThrow();
		expect(() => schema.validate(true)).toThrow();
		expect(() => schema.validate(null)).toThrow();
		expect(() => schema.validate("")).toThrow();
	});
});
describe("options.value", () => {
	test("Undefined returns default default value (empty string)", () => {
		const schema = new PhoneSchema({});
		expect(() => schema.validate(undefined)).toThrow();
	});
	test("Undefined with default value returns default value", () => {
		const schema = new PhoneSchema({ value: "+441234567890" });
		expect(schema.validate(undefined)).toBe("+441234567890");
	});
});
