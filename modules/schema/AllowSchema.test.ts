import { ALLOW_STRING, AllowStringSchema, InvalidFeedback, Feedback, Schema, ALLOW_NUMBER, AllowNumberSchema } from "../index.js";

test("TypeScript", () => {
	// String array options.
	const aaa: Schema<"a" | "b"> = ALLOW_STRING(["a", "b"]);
	const bbb: "a" | "b" = ALLOW_STRING(["a", "b"]).validate("a");
	const ccc: Schema<"a" | "b"> = new AllowStringSchema({ allow: ["a", "b"] });
	const ddd: "a" | "b" = new AllowStringSchema({ allow: ["a", "b"] }).validate("a");
	// String object options.
	const eee: Schema<"a" | "b"> = ALLOW_STRING({ a: "A", b: "B" });
	const fff: "a" | "b" = ALLOW_STRING({ a: "A", b: "B" }).validate("a");
	const ggg: Schema<"a" | "b"> = new AllowStringSchema({ allow: { a: "A", b: "B" } });
	const hhh: "a" | "b" = new AllowStringSchema({ allow: { a: "A", b: "B" } }).validate("a");
	// Number array options.
	const iii: Schema<1 | 2> = ALLOW_NUMBER([1, 2]);
	const jjj: 1 | 2 = ALLOW_NUMBER([1, 2]).validate(2);
	const kkk: Schema<1 | 2> = new AllowNumberSchema({ allow: [1, 2] });
	const lll: 1 | 2 = new AllowNumberSchema({ allow: [1, 2] }).validate(2);
	// Number object options.
	const mmm: Schema<1 | 2> = ALLOW_NUMBER({ 1: "A", 2: "B" });
	const nnn: 1 | 2 = ALLOW_NUMBER({ 1: "A", 2: "B" }).validate(1);
	const ooo: Schema<1 | 2> = new AllowNumberSchema({ allow: { 1: "A", 2: "B" } });
	const ppp: 1 | 2 = new AllowNumberSchema({ allow: { 1: "A", 2: "B" } }).validate(1);
});
test("Value is allowed if it exists in array options", () => {
	const schema1 = new AllowStringSchema({ allow: ["a", "b", "c"] });
	expect(schema1.validate("a")).toBe("a");
	const schema2 = new AllowNumberSchema({ allow: [1, 2, 3] });
	expect(schema2.validate(1)).toBe(1);
});
test("Invalid if value doesn't exist in array options", () => {
	const schema1 = new AllowStringSchema({ allow: ["a", "b", "c"] });
	expect(() => schema1.validate("d")).toThrow(InvalidFeedback);
	const schema2 = new AllowNumberSchema({ allow: [1, 2, 3] });
	expect(() => schema2.validate(4)).toThrow(InvalidFeedback);
});
test("Value is allowed if it exists in object options", () => {
	const schema1 = new AllowStringSchema({ allow: { a: "A", b: "B", c: "C" } });
	expect(schema1.validate("a")).toBe("a");
	const schema2 = new AllowNumberSchema({ allow: { 1: "A", 2: "B", 3: "C" } });
	expect(schema2.validate(2)).toBe(2);
});
test("Invalid if value doesn't exist in object options", () => {
	const schema = new AllowStringSchema({ allow: { a: "A", b: "B", c: "C" } });
	expect(() => schema.validate("d")).toThrow(InvalidFeedback);
	const schema2 = new AllowNumberSchema({ allow: { 1: "A", 2: "B", 3: "C" } });
	expect(() => schema2.validate(4)).toThrow(InvalidFeedback);
});
