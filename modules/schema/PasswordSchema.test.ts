import { expect, test } from "bun:test";
import { PASSWORD, PasswordSchema } from "shelving/schema";

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
test("formats the password unchanged so a password input can hold and mask it", () => {
	expect(PASSWORD.format("hunter2")).toBe("hunter2");
});
