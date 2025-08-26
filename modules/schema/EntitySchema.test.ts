import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { ENTITY, EntitySchema, Feedback, NULLABLE_ENTITY } from "../index.js";

// Tests.
test("TypeScript", () => {
	const s1 = NULLABLE_ENTITY;
	const b1: Schema<string | null> = s1;
	const r1: string | null = s1.validate("challenge:a1b2c3");

	const s2 = ENTITY;
	const b2: Schema<string> = s2;
	const c2: EntitySchema<string> = s2;
	const r2: string = s2.validate("challenge:a1b2c3");

	const s3 = new EntitySchema({});
	const c3: EntitySchema<string> = s3;
	const r3: string = s3.validate("challenge:a1b2c3");

	const s4 = new EntitySchema({ types: ["challenge", "user"] });
	const c4: EntitySchema<"challenge" | "user"> = s4;
	const r4: string = s4.validate("challenge:a1b2c3");
});
test("constructor()", () => {
	const schema1 = new EntitySchema({});
	expect(schema1).toBeInstanceOf(EntitySchema);
	const schema2 = ENTITY;
	expect(schema2).toBeInstanceOf(EntitySchema);
	const schema3 = ENTITY;
	expect(schema3).toBeInstanceOf(EntitySchema);
});
describe("validate()", () => {
	describe("EntitySchema without types", () => {
		const schema = new EntitySchema({});
		test("Valid files are valid", () => {
			expect(schema.validate("challenge:a1b2c3")).toBe("challenge:a1b2c3");
			expect(schema.validate("user:123")).toBe("user:123");
		});
		test("Invalid files are invalid", () => {
			expect(() => schema.validate("challenge")).toThrow(Feedback);
			expect(() => schema.validate("challenge:")).toThrow(Feedback);
		});
	});
	describe("EntitySchema with types", () => {
		const schema = new EntitySchema({ types: ["challenge", "user"] });
		test("Valid files are valid", () => {
			expect(schema.validate("challenge:a1b2c3")).toBe("challenge:a1b2c3");
			expect(schema.validate("user:123")).toBe("user:123");
		});
		test("Invalid files are invalid for format reasons", () => {
			expect(() => schema.validate("challenge")).toThrow(Feedback);
			expect(() => schema.validate("challenge.")).toThrow(Feedback);
		});
		test("Invalid files are invalid for type reasons", () => {
			expect(() => schema.validate("icecream:abc123")).toThrow(Feedback);
			expect(() => schema.validate("challenges:abc")).toThrow(Feedback);
		});
	});
});
describe("options.value", () => {
	test("Undefined with default value returns default value", () => {
		const schema = new EntitySchema({ value: "challenge:123" });
		expect(schema.validate(undefined)).toBe("challenge:123");
	});
});
