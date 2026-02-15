import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { KEY, KeySchema, NULLABLE_KEY } from "../index.js";

// Tests.
test("TypeScript", () => {
	const s1: Schema<string | null> = NULLABLE_KEY;
	const r1: string | null = s1.validate("ABC");

	const s2: Schema<string> = KEY;
	const r2: string = s2.validate("ABC");

	const s3: Schema<string> = new KeySchema({});
	const r3: string = s3.validate("ABC");
});
test("constructor()", () => {
	const schema1 = new KeySchema({});
	expect(schema1).toBeInstanceOf(KeySchema);
	const schema2 = KEY;
	expect(schema2).toBeInstanceOf(KeySchema);
	const schema3 = KEY;
	expect(schema3).toBeInstanceOf(KeySchema);
});
describe("validate()", () => {
	const schema = new KeySchema({});
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
	test("Non-strings are invalid", () => {
		expect(() => schema.validate([])).toThrow();
		expect(() => schema.validate({})).toThrow();
		expect(() => schema.validate(true)).toThrow();
		expect(() => schema.validate(null)).toThrow();
	});
	test("Empty strings are required", () => {
		expect(() => schema.validate(undefined)).toThrow();
		expect(() => schema.validate("")).toThrow();
	});
});
describe("options.value", () => {
	test("Undefined with value returns value", () => {
		const schema = new KeySchema({ value: "abc" });
		expect(schema.validate(undefined)).toBe("abc");
	});
});
