import { ALLOW, AllowedSchema, InvalidFeedback, Feedback, Schema } from "../index.js";

test("TypeScript", () => {
	// Array options.
	const aaa: Schema<"a" | "b"> = ALLOW(["a", "b"]);
	const bbb: "a" | "b" | Feedback = ALLOW(["a", "b"]).validate("a");
	const ccc: Schema<"a" | "b"> = new AllowedSchema({ allow: ["a", "b"] });
	const ddd: "a" | "b" | Feedback = new AllowedSchema({ allow: ["a", "b"] }).validate("a");
	// Object options.
	const eee: Schema<"a" | "b"> = ALLOW({ a: "A", b: "B" });
	const fff: "a" | "b" | Feedback = ALLOW({ a: "A", b: "B" }).validate("a");
	const ggg: Schema<"a" | "b"> = new AllowedSchema({ allow: { a: "A", b: "B" } });
	const hhh: "a" | "b" | Feedback = new AllowedSchema({ allow: { a: "A", b: "B" } }).validate("a");
});
test("Value is allowed if it exists in array options", () => {
	const schema = new AllowedSchema({ allow: ["a", "b", "c"] });
	expect(schema.validate("a")).toBe("a");
});
test("Invalid if value doesn't exist in array options", () => {
	const schema = new AllowedSchema({ allow: ["a", "b", "c"] });
	expect(() => schema.validate("d")).toThrow(InvalidFeedback);
});
test("Value is allowed if it exists in object options", () => {
	const schema = new AllowedSchema({ allow: { a: "A", b: "B", c: "C" } });
	expect(schema.validate("a")).toBe("a");
});
test("Invalid if value doesn't exist in object options", () => {
	const schema = new AllowedSchema({ allow: { a: "A", b: "B", c: "C" } });
	expect(() => schema.validate("d")).toThrow(InvalidFeedback);
});
