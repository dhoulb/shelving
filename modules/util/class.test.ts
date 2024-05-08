import { expect, test } from "@jest/globals";
import { isConstructor } from "../index.js";

test("isClass(): Works correctly", () => {
	// Classes.
	expect(isConstructor(class Abc {})).toBe(true);
	expect(isConstructor(class {})).toBe(true);

	// Non-classes.
	expect(isConstructor(true)).toBe(false);
	expect(isConstructor("abc")).toBe(false);
	expect(isConstructor(123)).toBe(false);
	expect(isConstructor(function abc() {})).toBe(false);
	expect(isConstructor(function Abc() {})).toBe(false);
	expect(isConstructor(() => {})).toBe(false);
});
