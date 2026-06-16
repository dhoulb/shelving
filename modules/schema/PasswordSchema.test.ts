import { expect, test } from "bun:test";
import { PASSWORD, PasswordSchema } from "../index.js";

test("constructor()", () => {
	const schema1 = new PasswordSchema({});
	expect(schema1).toBeInstanceOf(PasswordSchema);
	const schema2 = PASSWORD;
	expect(schema2).toBeInstanceOf(PasswordSchema);
});
test("defaults the input hint to password", () => {
	expect(new PasswordSchema({}).input).toBe("password");
});
test("allows the input hint to be overridden (e.g. show-password toggle)", () => {
	expect(new PasswordSchema({ input: "text" }).input).toBe("text");
});
test("validates a password string", () => {
	expect(PASSWORD.validate("hunter2")).toBe("hunter2");
});
test("never formats a password for display", () => {
	expect(PASSWORD.format()).toBe("");
});
