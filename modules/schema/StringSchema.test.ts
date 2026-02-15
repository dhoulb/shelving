import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { REQUIRED_STRING, STRING, StringSchema } from "../index.js";

// Vars.
const longString =
	"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus.";

// Tests.
test("TypeScript", () => {
	// Test string.optional
	const schema1: Schema<string | null> = STRING;
	const schemaResult1: string | null = schema1.validate("ABC");

	// Test string.required
	const schema2: Schema<string> = REQUIRED_STRING;
	const schemaResult2: string = schema2.validate("ABC");

	// Test string({})
	const schema4: StringSchema = new StringSchema({});
	const schemaResult4: string = schema4.validate("ABC");
});
test("constructor()", () => {
	const schema1 = new StringSchema({});
	expect(schema1).toBeInstanceOf(StringSchema);
	const schema2 = REQUIRED_STRING;
	expect(schema2).toBeInstanceOf(StringSchema);
	const schema3 = STRING;
	expect(schema3).toBeInstanceOf(StringSchema);
});
describe("validate()", () => {
	const schema = new StringSchema({});
	test("Strings pass through unchanged", () => {
		expect(schema.validate(longString)).toBe(longString);
		expect(schema.validate("abcdef")).toBe("abcdef");
	});
	test("Strings are converted to strings", () => {
		expect(schema.validate(1)).toBe("1");
		expect(schema.validate(123)).toBe("123");
		expect(schema.validate(100039384)).toBe("100039384");
	});
	test("Non-strings (except numbers) throw Invalid", () => {
		expect(() => schema.validate(null)).toThrow();
		expect(() => schema.validate(false)).toThrow();
		expect(() => schema.validate(true)).toThrow();
		expect(() => schema.validate([])).toThrow();
		expect(() => schema.validate({})).toThrow();
		expect(() => schema.validate(() => {})).toThrow();
	});
});
describe("options.default", () => {
	test("Undefined returns empty string", () => {
		const schema = new StringSchema({});
		expect(schema.validate(undefined)).toBe("");
	});
	test("Undefined with default returns default value", () => {
		const schema = new StringSchema({ value: "abc" });
		expect(schema.validate(undefined)).toBe("abc");
	});
});
describe("options.min", () => {
	test("Strings shorter than the minimum are invalid", () => {
		const schema = new StringSchema({ min: 10 });
		expect(() => schema.validate("a")).toThrow();
	});
});
describe("options.max", () => {
	test("Strings longer than the maximum are trimmed", () => {
		const schema = new StringSchema({ max: 3 });
		expect(() => schema.validate("abcdef")).toThrow();
	});
});
