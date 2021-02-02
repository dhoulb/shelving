/* eslint-disable no-template-curly-in-string */

import { matchTemplate, renderTemplate, getPlaceholders } from "..";

// Tests.
describe("matchTemplate()", () => {
	test("Correct matches (string template)", () => {
		expect(matchTemplate("a", "a")).toEqual({});
		expect(matchTemplate("/a/", "/a/")).toEqual({});
		expect(matchTemplate(":a", "1")).toEqual({ a: "1" });
		expect(matchTemplate("/:a", "/1")).toEqual({ a: "1" });
		expect(matchTemplate("/:a/", "/1/")).toEqual({ a: "1" });
		expect(matchTemplate("/:a/:b", "/1/2")).toEqual({ a: "1", b: "2" });
		expect(matchTemplate("/:a/{b}/${c}/{{d}}/", "/1/2/3/4/")).toEqual({ a: "1", b: "2", c: "3", d: "4" });
		expect(matchTemplate("/*", "/1")).toEqual({ "0": "1" });
		expect(matchTemplate("/*/*", "/1/2")).toEqual({ "0": "1", "1": "2" });
	});
	test("Correct matches (iterable objects)", () => {
		expect(matchTemplate(["a"], "a")).toEqual({});
		expect(matchTemplate(["/a/"], "/a/")).toEqual({});
		expect(matchTemplate([":a"], "1")).toEqual({ a: "1" });
		expect(matchTemplate(["/:a"], "/1")).toEqual({ a: "1" });
		expect(matchTemplate(["/:a/"], "/1/")).toEqual({ a: "1" });
		expect(matchTemplate(["/:a/:b"], "/1/2")).toEqual({ a: "1", b: "2" });
		expect(matchTemplate(["/:a/{b}/${c}/{{d}}/"], "/1/2/3/4/")).toEqual({ a: "1", b: "2", c: "3", d: "4" });
		expect(matchTemplate(["/:a/", "/:a/:b"], "/1/2")).toEqual({ a: "1", b: "2" }); // Second template matches.
		expect(matchTemplate(new Set(["a"]), "a")).toEqual({});
		expect(matchTemplate(new Set(["/a/"]), "/a/")).toEqual({});
		expect(matchTemplate(new Set([":a"]), "1")).toEqual({ a: "1" });
		expect(matchTemplate(new Set(["/:a"]), "/1")).toEqual({ a: "1" });
		expect(matchTemplate(new Set(["/:a/"]), "/1/")).toEqual({ a: "1" });
		expect(matchTemplate(new Set(["/:a/:b"]), "/1/2")).toEqual({ a: "1", b: "2" });
		expect(matchTemplate(new Set(["/:a/{b}/${c}/{{d}}/"]), "/1/2/3/4/")).toEqual({ a: "1", b: "2", c: "3", d: "4" });
		expect(matchTemplate(new Set(["/:a/", "/:a/:b/"]), "/1/2/")).toEqual({ a: "1", b: "2" }); // Second template matches.
	});
	test("Correct matches (function)", () => {
		function template() {
			return "/:a/";
		}
		expect(matchTemplate(template, "/1/")).toEqual({ a: "1" });
	});
	test("Correct matches (generator function)", () => {
		function* templates() {
			yield "/:a/";
			yield "/:a/:b/";
		}
		expect(matchTemplate(templates, "/1/2/")).toEqual({ a: "1", b: "2" });
	});
	test("Correct non-matches", () => {
		// No params.
		expect(matchTemplate("a", "b")).toBe(undefined);
		// Incorrect start.
		expect(matchTemplate("-{a}", "|1")).toBe(undefined);
		expect(matchTemplate("-{a}", "!!!-1")).toBe(undefined);
		expect(matchTemplate("!!!-{a}", "-1")).toBe(undefined);
		// Incorrect separator.
		expect(matchTemplate("-{a}-{b}-", "-1|2-")).toBe(undefined);
		expect(matchTemplate("-{a}-{b}-", "-1-!!!-2-")).toBe(undefined);
		expect(matchTemplate("-{a}-!!!-{b}-", "-1-2-")).toBe(undefined);
		// Incorrect end.
		expect(matchTemplate("-{a}-{b}-", "-1-2|")).toBe(undefined);
		expect(matchTemplate("-{a}-{b}-", "-1-2-!!!")).toBe(undefined);
		expect(matchTemplate("-{a}-{b}-!!!", "-1-2-")).toBe(undefined);
		// Empty placeholder values.
		expect(matchTemplate("{a}", "")).toEqual(undefined);
		expect(matchTemplate("a/{b}", "a/")).toEqual(undefined);
		expect(matchTemplate("a/{b}/{c}", "a/b/")).toEqual(undefined);
		// No templates match.
		expect(matchTemplate(["/:a/", "/:a/:b/"], "/a/b/c/")).toBe(undefined);
		expect(matchTemplate(new Set(["/:a/", "/:a/:b/"]), "/a/b/c/")).toBe(undefined);
	});
	test("Cannot match two placeholders that touch", () => {
		expect(() => matchTemplate(":a:b", "ab")).toThrow(SyntaxError);
		expect(() => matchTemplate(":a{b}", "ab")).toThrow(SyntaxError);
	});
});
describe("getPlaceholders()", () => {
	test("Splits correctly", () => {
		expect(getPlaceholders("")).toEqual([]);
		expect(getPlaceholders(":a/:b")).toEqual(["a", "b"]);
		expect(getPlaceholders("/:a/{b}/${c}/{{d}}/")).toEqual(["a", "b", "c", "d"]);
		expect(getPlaceholders("/*/")).toEqual(["0"]);
		expect(getPlaceholders("*/*")).toEqual(["0", "1"]);
		expect(getPlaceholders("*/{a}/*/${b}/*")).toEqual(["0", "a", "1", "b", "2"]);
	});
	test("Splits correctly using cache", () => {
		expect(getPlaceholders("")).toEqual([]);
		expect(getPlaceholders("")).toEqual([]);
		expect(getPlaceholders(":a/:b")).toEqual(["a", "b"]);
		expect(getPlaceholders(":a/:b")).toEqual(["a", "b"]);
	});
	test("Cannot match two placeholders that touch", () => {
		expect(() => getPlaceholders("/:a{b}${c}{{d}}/")).toThrow(SyntaxError);
		expect(() => getPlaceholders(":a{b}")).toThrow(SyntaxError);
	});
});
describe("renderTemplate()", () => {
	test("String values", () => {
		expect(renderTemplate("/a", "123")).toBe("/a");
		expect(renderTemplate("/:a", "123")).toBe("/123");
		expect(renderTemplate("/:a/:b", "123")).toBe("/123/123");
		expect(renderTemplate("/*/*", "123")).toBe("/123/123");
	});
	test("Function values", () => {
		expect(renderTemplate("/a", p => p)).toBe("/a");
		expect(renderTemplate("/:a", p => p)).toBe("/a");
		expect(renderTemplate("/:a/:b", p => p)).toBe("/a/b");
		expect(renderTemplate("/*/*", p => p)).toBe("/0/1");
	});
	test("Object values with string properties", () => {
		expect(renderTemplate("/a", {})).toBe("/a");
		expect(renderTemplate("/:a", { a: "1" })).toBe("/1");
		expect(renderTemplate("/:a/:b", { a: "1", b: "2" })).toBe("/1/2");
		expect(renderTemplate("/*/*", { "0": "A", "1": "B" })).toBe("/A/B");
	});
	test("Array values with string items", () => {
		expect(renderTemplate("/*/", ["A"])).toBe("/A/");
		expect(renderTemplate("/*/*", ["A", "B"])).toBe("/A/B");
	});
	test("ReferenceError for missing parameters", () => {
		expect(() => renderTemplate("/:a", {})).toThrow(ReferenceError);
		expect(() => renderTemplate("/:a/:b", { a: "abc" })).toThrow(ReferenceError);
		expect(() => renderTemplate("/a/:a", {})).toThrow(ReferenceError);
		expect(() => renderTemplate("/*/", [])).toThrow(ReferenceError);
		expect(() => renderTemplate("/*/*", ["A"])).toThrow(ReferenceError);
	});
});
