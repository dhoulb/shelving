import { describe, expect, test } from "bun:test";
import {
	RequiredError,
	type TemplateMatches,
	ValueError,
	getPlaceholders,
	matchTemplate,
	matchTemplates,
	renderTemplate,
} from "../index.js";

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
	test("Correct non-matches", () => {
		// No params.
		expect<TemplateMatches | undefined>(matchTemplate("a", "b")).toBe(undefined);
		// Incorrect start.
		expect<TemplateMatches | undefined>(matchTemplate("-{a}", "|1")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("-{a}", "!!!-1")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("!!!-{a}", "-1")).toBe(undefined);
		// Incorrect separator.
		expect<TemplateMatches | undefined>(matchTemplate("-{a}-{b}-", "-1|2-")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("-{a}-{b}-", "-1-!!!-2-")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("-{a}-!!!-{b}-", "-1-2-")).toBe(undefined);
		// Incorrect end.
		expect<TemplateMatches | undefined>(matchTemplate("-{a}-{b}-", "-1-2|")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("-{a}-{b}-", "-1-2-!!!")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("-{a}-{b}-!!!", "-1-2-")).toBe(undefined);
		// Empty placeholder values.
		expect<TemplateMatches | undefined>(matchTemplate("{a}", "")).toEqual(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("a/{b}", "a/")).toEqual(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("a/{b}/{c}", "a/b/")).toEqual(undefined);
	});
	test("Cannot match two placeholders that touch", () => {
		expect(() => matchTemplate(":a:b", "ab")).toThrow(ValueError);
		expect(() => matchTemplate(":a{b}", "ab")).toThrow(ValueError);
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
		expect(() => getPlaceholders("/:a{b}${c}{{d}}/")).toThrow(ValueError);
		expect(() => getPlaceholders(":a{b}")).toThrow(ValueError);
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
	test("RequiredError for missing parameters", () => {
		expect(() => renderTemplate("/:a", {})).toThrow(RequiredError);
		expect(() => renderTemplate("/:a/:b", { a: "abc" })).toThrow(RequiredError);
		expect(() => renderTemplate("/a/:a", {})).toThrow(RequiredError);
		expect(() => renderTemplate("/*/", [])).toThrow(RequiredError);
		expect(() => renderTemplate("/*/*", ["A"])).toThrow(RequiredError);
	});
});
describe("matchTemplates()", () => {
	test("Correct matches (iterable objects)", () => {
		expect(matchTemplates(["a"], "a")).toEqual({});
		expect(matchTemplates(["/a/"], "/a/")).toEqual({});
		expect(matchTemplates([":a"], "1")).toEqual({ a: "1" });
		expect(matchTemplates(["/:a"], "/1")).toEqual({ a: "1" });
		expect(matchTemplates(["/:a/"], "/1/")).toEqual({ a: "1" });
		expect(matchTemplates(["/:a/:b"], "/1/2")).toEqual({ a: "1", b: "2" });
		expect(matchTemplates(["/:a/{b}/${c}/{{d}}/"], "/1/2/3/4/")).toEqual({ a: "1", b: "2", c: "3", d: "4" });
		expect(matchTemplates(["/:a/", "/:a/:b"], "/1/2")).toEqual({ a: "1", b: "2" }); // Second template matches.
		expect(matchTemplates(new Set(["a"]), "a")).toEqual({});
		expect(matchTemplates(new Set(["/a/"]), "/a/")).toEqual({});
		expect(matchTemplates(new Set([":a"]), "1")).toEqual({ a: "1" });
		expect(matchTemplates(new Set(["/:a"]), "/1")).toEqual({ a: "1" });
		expect(matchTemplates(new Set(["/:a/"]), "/1/")).toEqual({ a: "1" });
		expect(matchTemplates(new Set(["/:a/:b"]), "/1/2")).toEqual({ a: "1", b: "2" });
		expect(matchTemplates(new Set(["/:a/{b}/${c}/{{d}}/"]), "/1/2/3/4/")).toEqual({ a: "1", b: "2", c: "3", d: "4" });
		expect(matchTemplates(new Set(["/:a/", "/:a/:b/"]), "/1/2/")).toEqual({ a: "1", b: "2" }); // Second template matches.
	});
	test("Correct non-matches", () => {
		// No templates match.
		expect<TemplateMatches | undefined>(matchTemplates(["/:a/", "/:a/:b/"], "/a/b/c/")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchTemplates(new Set(["/:a/", "/:a/:b/"]), "/a/b/c/")).toBe(undefined);
	});
});
