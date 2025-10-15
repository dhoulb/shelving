import { expect, test } from "bun:test";
import { NumberSchema } from "./NumberSchema.js";
import { OPTIONAL, OptionalSchema } from "./OptionalSchema.js";
import { StringSchema } from "./StringSchema.js";

test("TypeScript", () => {
	// Test OptionalSchema type inference
	const schema1: OptionalSchema<string> = OPTIONAL(new StringSchema({}));
	const schemaResult1: string | undefined = schema1.validate("ABC");
	// Test OPTIONAL helper
	const schema2 = OPTIONAL(new NumberSchema({}));
	const schemaResult2: number | undefined = schema2.validate(123);
});
test("constructor()", () => {
	const stringSchema = new StringSchema({});
	const schema = new OptionalSchema({ source: stringSchema });
	expect(schema).toBeInstanceOf(OptionalSchema);
});
test("OPTIONAL helper", () => {
	const stringSchema = new StringSchema({});
	const schema = OPTIONAL(stringSchema);
	expect(schema).toBeInstanceOf(OptionalSchema);
});
test("validate() with undefined returns undefined", () => {
	const stringSchema = new StringSchema({});
	const schema = OPTIONAL(stringSchema);
	expect(schema.validate(undefined)).toBe(undefined);
});
test("validate() with valid value returns validated value", () => {
	const stringSchema = new StringSchema({});
	const schema = OPTIONAL(stringSchema);
	expect(schema.validate("hello")).toBe("hello");
	expect(schema.validate(123)).toBe("123"); // Numbers convert to strings
});
test("validate() throws for invalid values", () => {
	const stringSchema = new StringSchema({ min: 5 });
	const schema = OPTIONAL(stringSchema);
	expect(() => schema.validate("abc")).toThrow(); // Too short
	expect(schema.validate("abcdef")).toBe("abcdef"); // Valid
	expect(schema.validate(undefined)).toBe(undefined); // Undefined is valid
});
test("validate() with number schema", () => {
	const numberSchema = new NumberSchema({});
	const schema = OPTIONAL(numberSchema);
	expect(schema.validate(123)).toBe(123);
	expect(schema.validate("456")).toBe(456);
	expect(schema.validate(undefined)).toBe(undefined);
	expect(() => schema.validate("not a number")).toThrow();
});
test("validate() default value is always undefined", () => {
	const stringSchema = new StringSchema({ value: "default" });
	const schema = OPTIONAL(stringSchema);
	expect(schema.validate(undefined)).toBe(undefined); // undefined passes through
	expect(schema.validate("custom")).toBe("custom");
});
test("validate() default value is set on the OptionalSchema", () => {
	const stringSchema = new StringSchema({ value: "abc" });
	const schema = new OptionalSchema({ source: stringSchema, value: undefined });
	expect(schema.validate(undefined)).toBe(undefined); // undefined passes through
	expect(schema.validate("custom")).toBe("custom");
});
test("validate() preserves source schema validation", () => {
	const stringSchema = new StringSchema({ min: 3, max: 10 });
	const schema = OPTIONAL(stringSchema);
	expect(schema.validate(undefined)).toBe(undefined);
	expect(schema.validate("abc")).toBe("abc");
	expect(schema.validate("abcdefghij")).toBe("abcdefghij");
	expect(() => schema.validate("ab")).toThrow(); // Too short
	expect(() => schema.validate("abcdefghijklmnop")).toThrow(); // Too long
});
