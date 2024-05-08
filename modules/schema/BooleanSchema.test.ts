import { describe, expect, test } from "@jest/globals";
import type { Schema } from "../index.js";
import { BOOLEAN, BooleanSchema } from "../index.js";

// Tests.
test("TypeScript", () => {
	const s1: Schema<boolean> = BOOLEAN;
	const r1: boolean = s1.validate(true);
});
test("constructor()", () => {
	const schema1 = new BooleanSchema({});
	expect(schema1).toBeInstanceOf(BooleanSchema);
});
describe("validate()", () => {
	const schema = BOOLEAN;
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
		const schema1 = new BooleanSchema({ value: true });
		expect(schema1.value).toBe(true);
		expect(schema1.validate(undefined)).toEqual(true);
		const schema2 = new BooleanSchema({ value: false });
		expect(schema2.value).toBe(false);
		expect(schema2.validate(undefined)).toEqual(false);
	});
	test("Defaults to false", () => {
		const schema = BOOLEAN;
		expect(schema.validate(undefined)).toEqual(false);
	});
});
