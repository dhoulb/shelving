import { isClass } from "../index.js";

test("isClass(): Works correctly", () => {
	// Classes.
	expect(isClass(class Abc {})).toBe(true);
	expect(isClass(class {})).toBe(true);

	// Non-classes.
	expect(isClass(true)).toBe(false);
	expect(isClass("abc")).toBe(false);
	expect(isClass(123)).toBe(false);
	expect(isClass(function abc() {})).toBe(false);
	expect(isClass(function Abc() {})).toBe(false);
	expect(isClass(() => {})).toBe(false);
});
