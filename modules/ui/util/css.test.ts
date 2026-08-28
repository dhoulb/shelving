import { describe, expect, test } from "bun:test";
import { getClass, getModuleClass } from "shelving/ui";

describe("getClass", () => {
	test("joins strings, arrays, and true-valued variant keys", () => {
		expect(getClass("a", ["b", "c"], { d: true, e: false })).toBe("a b c d");
	});

	test("ignores `null` and `undefined`", () => {
		expect(getClass("a", null, undefined, "b")).toBe("a b");
	});
});

describe("getModuleClass", () => {
	test("maps class keys through the module dictionary", () => {
		expect(getModuleClass({ track: "abc123" }, "track")).toBe("abc123");
		expect(getModuleClass({ track: "abc123", spin: "def456" }, "track", "spin")).toBe("abc123 def456");
	});

	test("returns `undefined` when the module is a string (unprocessed CSS module)", () => {
		expect(getModuleClass("./Loading.module.css", "track")).toBeUndefined();
	});

	test('returns `undefined` when no classes match, so no empty `class=""` attribute renders', () => {
		// Some environments (e.g. `bun test` v1.4+) import a `.module.css` as an empty object.
		expect(getModuleClass({}, "track")).toBeUndefined();
		expect(getModuleClass({ track: "abc123" }, "missing")).toBeUndefined();
	});
});
