import { expect, test } from "@jest/globals";
import type { Schema } from "../index.js";
import { ALLOW, ALLOW_STRING, AllowSchema, AllowStringSchema, Feedback } from "../index.js";

test("TypeScript", () => {
	// String object options.
	const eee: Schema<"a" | "b"> = ALLOW_STRING({ a: "A", b: "B" });
	const fff: "a" | "b" = ALLOW_STRING({ a: "A", b: "B" }).validate("a");
	const ggg: Schema<"a" | "b"> = new AllowStringSchema({ allow: { a: "A", b: "B" } });
	const hhh: "a" | "b" = new AllowStringSchema({ allow: { a: "A", b: "B" } }).validate("a");
	const aaa = new AllowStringSchema({ allow: { a: "A", b: "B" } }).validate("a");
	const bbb: "a" | "b" = aaa;
	// Map options.
	type T = 1 | "a" | null;
	const map = new Map<T, string>([
		[1, "A"],
		["a", "B"],
		[null, "C"],
	]);
	const qqq2: Schema<T> = ALLOW(map);
	const rrr2: T = ALLOW(map).validate(1);
	const sss2: Schema<T> = new AllowSchema({ allow: map });
	const ttt2: T = new AllowSchema({ allow: map }).validate(1);
});
test("Value is allowed if it exists in object options", () => {
	const schema1 = new AllowStringSchema({ allow: { a: "A", b: "B", c: "C" } });
	expect(schema1.validate("a")).toBe("a");
	const schema2 = new AllowStringSchema({ allow: { 1: "A", 2: "B", 3: "C" } });
	expect(schema2.validate("2")).toBe("2");
});
test("Invalid if value doesn't exist in object options", () => {
	const schema1 = new AllowStringSchema({ allow: { a: "A", b: "B", c: "C" } });
	expect(() => schema1.validate("d")).toThrow(Feedback);
	const schema2 = new AllowStringSchema({ allow: { 1: "A", 2: "B", 3: "C" } });
	expect(() => schema2.validate(2)).toThrow(Feedback); // Must be string.
});
test("Value is allowed if it exists in map options", () => {
	const schema1 = new AllowSchema({
		allow: new Map([
			["a", "A"],
			["b", "B"],
			["c", "C"],
		]),
	});
	expect(schema1.validate("a")).toBe("a");
	const schema2 = new AllowSchema({
		allow: new Map([
			[1, "A"],
			[2, "B"],
			[3, "C"],
		]),
	});
	expect(schema2.validate(2)).toBe(2);
});
test("Invalid if value doesn't exist in map options", () => {
	const schema1 = new AllowSchema({
		allow: new Map([
			["a", "A"],
			["b", "B"],
			["c", "C"],
		]),
	});
	expect(() => schema1.validate("d")).toThrow(Feedback);
	const schema2 = new AllowSchema({
		allow: new Map([
			[1, "A"],
			[2, "B"],
			[3, "C"],
		]),
	});
	expect(() => schema2.validate(4)).toThrow(Feedback);
});
