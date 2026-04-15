import { expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { CHOICE, ChoiceSchema } from "../index.js";

test("TypeScript", () => {
	// String object options.
	const eee: Schema<"a" | "b"> = CHOICE({ a: "A", b: "B" });
	const fff: "a" | "b" = CHOICE({ a: "A", b: "B" }).validate("a");
	const ggg: Schema<"a" | "b"> = new ChoiceSchema({ options: { a: "A", b: "B" } });
	const hhh: "a" | "b" = new ChoiceSchema({ options: { a: "A", b: "B" } }).validate("a");
	const aaa = new ChoiceSchema({ options: { a: "A", b: "B" } }).validate("a");
	const bbb: "a" | "b" = aaa;
});
test("Value is allowed if it exists in object options", () => {
	const schema1 = new ChoiceSchema({ options: { a: "A", b: "B", c: "C" } });
	expect(schema1.validate("a")).toBe("a");
	const schema2 = new ChoiceSchema({ options: { 1: "A", 2: "B", 3: "C" } });
	expect(schema2.validate("2")).toBe("2");
});
test("Value is allowed if it exists in array options", () => {
	const schema1 = new ChoiceSchema({ options: ["a", "b", "c"] });
	expect(schema1.validate("a")).toBe("a");
	const schema2 = new ChoiceSchema({ options: ["1", "2", "3"] });
	expect(schema2.validate("2")).toBe("2");
});
test("Default value is undefined when none is provided", () => {
	const schema1 = new ChoiceSchema({ options: { a: "A", b: "B", c: "C" } });
	expect(schema1.value).toBeUndefined();
	expect(() => schema1.validate(undefined)).toThrow();

	const schema2 = new ChoiceSchema({ options: ["1", "2", "3"] });
	expect(schema2.value).toBeUndefined();
	expect(() => schema2.validate(undefined)).toThrow();
});
test("Explicit default value is preserved", () => {
	const schema1 = new ChoiceSchema<"a" | "b" | "c">({ options: { a: "A", b: "B", c: "C" }, value: "b" });
	expect(schema1.value).toBe("b");
	expect(schema1.validate(undefined)).toBe("b");

	const schema2 = new ChoiceSchema<"1" | "2" | "3">({ options: ["1", "2", "3"], value: "2" });
	expect(schema2.value).toBe("2");
	expect(schema2.validate(undefined)).toBe("2");
});
test("Invalid if value doesn't exist in object options", () => {
	const schema1 = new ChoiceSchema({ options: { a: "A", b: "B", c: "C" } });
	expect(() => schema1.validate("d")).toThrow();
	const schema2 = new ChoiceSchema({ options: { 1: "A", 2: "B", 3: "C" } });
	expect(() => schema2.validate(2)).toThrow(); // Must be string.
});

test("Invalid if value doesn't exist in array options", () => {
	const schema1 = new ChoiceSchema({ options: ["a", "b", "c"] });
	expect(() => schema1.validate("d")).toThrow();
	const schema2 = new ChoiceSchema({ options: ["1", "2", "3"] });
	expect(() => schema2.validate(2)).toThrow(); // Must be string.
});
