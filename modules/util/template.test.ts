import { describe, expect, test } from "bun:test";
import { RequiredError, ValueError } from "shelving/error";
import {
	getPlaceholders,
	matchPathTemplate,
	matchPathTemplates,
	matchTemplate,
	matchTemplates,
	renderPathTemplate,
	renderTemplate,
	type TemplateMatches,
} from "shelving/util/template";

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
		expect(matchTemplate("https://x.com/test2/{id}", "https://x.com/test2/123")).toEqual({ id: "123" });
	});
	test("No separator semantics — placeholders happily span `/`", () => {
		// Plain `matchTemplate` does not enforce path-segment boundaries.
		expect(matchTemplate("/review/{id}", "/review/30/mdt-view")).toEqual({ id: "30/mdt-view" });
		expect(matchTemplate("/files/{id}", "/files/a/b/c.txt")).toEqual({ id: "a/b/c.txt" });
	});
	test("Catchall placeholders allow empty values", () => {
		expect(matchTemplate("/files/{...path}", "/files/")).toEqual({ path: "" });
		expect(matchTemplate("/files/{...path}", "/files/a/b/c")).toEqual({ path: "a/b/c" });
		expect(matchTemplate("/files/{path*}", "/files/")).toEqual({ path: "" });
		expect(matchTemplate("/files/[...path]", "/files/x")).toEqual({ path: "x" });
		expect(matchTemplate("/files/:path*", "/files/")).toEqual({ path: "" });
	});
	test("Non-catchall placeholders reject empty values", () => {
		expect<TemplateMatches | undefined>(matchTemplate("{a}", "")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("a/{b}", "a/")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchTemplate("a/{b}/{c}", "a/b/")).toBe(undefined);
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
	});
	test("Cannot match two placeholders that touch", () => {
		expect(() => matchTemplate(":a:b", "ab")).toThrow(ValueError);
		expect(() => matchTemplate(":a{b}", "ab")).toThrow(ValueError);
	});
});

describe("matchPathTemplate()", () => {
	test("Named placeholders only match one path segment", () => {
		expect(matchPathTemplate("/review/{id}", "/review/30")).toEqual({ id: "30" });
		expect(matchPathTemplate("/review/{id}/mdt-view", "/review/30/mdt-view")).toEqual({ id: "30" });
		expect(matchPathTemplate("/review/*", "/review/30")).toEqual({ "0": "30" });
		expect(matchPathTemplate("/review/*/mdt-view", "/review/30/mdt-view")).toEqual({ "0": "30" });

		// Non-matching: single-segment placeholders reject multi-segment values.
		expect<TemplateMatches | undefined>(matchPathTemplate("/review/{id}", "/review/30/mdt-view")).toBe(undefined);
	});
	test("`**` matches multiple path segments", () => {
		expect(matchPathTemplate("/review/**", "/review/30/mdt-view")).toEqual({ "0": "30/mdt-view" });
		expect(matchPathTemplate("/files/**", "/files/a/b/c/d.txt")).toEqual({ "0": "a/b/c/d.txt" });
		expect(matchPathTemplate("/files/**/info", "/files/a/b/c/d/info")).toEqual({ "0": "a/b/c/d" });
		expect<TemplateMatches | undefined>(matchPathTemplate("/files/**/info", "/files/a/b/c/d.txt")).toBe(undefined);
	});
	test("`{...name}` is a named catchall, equivalent to `**` with a name", () => {
		expect(matchPathTemplate("/review/{...rest}", "/review/30/mdt-view")).toEqual({ rest: "30/mdt-view" });
		expect(matchPathTemplate("/files/{...path}", "/files/a/b/c/d.txt")).toEqual({ path: "a/b/c/d.txt" });
	});
	test("`{name*}` is an alternate named catchall syntax", () => {
		expect(matchPathTemplate("/files/{path*}", "/files/a/b/c")).toEqual({ path: "a/b/c" });
		expect(matchPathTemplate("/files/[path*]", "/files/a/b/c")).toEqual({ path: "a/b/c" });
		expect(matchPathTemplate("/files/:path*", "/files/a/b/c")).toEqual({ path: "a/b/c" });
		expect(matchPathTemplate("/files/[...path]", "/files/a/b/c")).toEqual({ path: "a/b/c" });
	});
	test("Tolerates extra catchall modifier chars — `**`/`***`/`...`/`....` are equivalent", () => {
		expect(matchPathTemplate("/files/**", "/files/a/b/c")).toEqual({ "0": "a/b/c" });
		expect(matchPathTemplate("/files/***", "/files/a/b/c")).toEqual({ "0": "a/b/c" });
		expect(matchPathTemplate("/files/{path**}", "/files/a/b/c")).toEqual({ path: "a/b/c" });
		expect(matchPathTemplate("/files/{path***}", "/files/a/b/c")).toEqual({ path: "a/b/c" });
		expect(matchPathTemplate("/files/{....path}", "/files/a/b/c")).toEqual({ path: "a/b/c" });
		expect(matchPathTemplate("/files/[.....path]", "/files/a/b/c")).toEqual({ path: "a/b/c" });
		expect(matchPathTemplate("/files/:path**", "/files/a/b/c")).toEqual({ path: "a/b/c" });
	});
	test("Trailing catchall also matches when the trailing separator is absent", () => {
		expect(matchPathTemplate("/files/{...path}", "/files")).toEqual({ path: "" });
		expect(matchPathTemplate("/files/{...path}", "/files/")).toEqual({ path: "" });
		expect(matchPathTemplate("/files/**", "/files")).toEqual({ "0": "" });
	});
	test("Percent-decodes matched values (inverse of renderPathTemplate)", () => {
		expect(matchPathTemplate("/users/{id}", "/users/a%2Fb")).toEqual({ id: "a/b" });
		expect(matchPathTemplate("/users/{id}", "/users/caf%C3%A9")).toEqual({ id: "café" });
		// Catchall decodes each segment but keeps the `/` separators.
		expect(matchPathTemplate("/files/{...path}", "/files/a%20b/c")).toEqual({ path: "a b/c" });
	});
	test("Rejects malformed percent-encoding as a non-match", () => {
		expect<TemplateMatches | undefined>(matchPathTemplate("/users/{id}", "/users/%zz")).toBe(undefined);
		expect<TemplateMatches | undefined>(matchPathTemplate("/users/{id}", "/users/%")).toBe(undefined);
	});
});

describe("getPlaceholders()", () => {
	test("Splits correctly", () => {
		expect(getPlaceholders("")).toEqual([]);
		expect(getPlaceholders(":a/:b")).toEqual(["a", "b"]);
		expect(getPlaceholders("/:a/{b}/${c}/{{d}}/")).toEqual(["a", "b", "c", "d"]);
		expect(getPlaceholders("/*/")).toEqual(["0"]);
		expect(getPlaceholders("*/*")).toEqual(["0", "1"]);
		expect(getPlaceholders("**")).toEqual(["0"]);
		expect(getPlaceholders("**|**")).toEqual(["0", "1"]);
		expect(getPlaceholders("*/{a}/*/${b}/*")).toEqual(["0", "a", "1", "b", "2"]);
	});
	test("Splits correctly with catchall modifiers", () => {
		expect(getPlaceholders("/{...path}")).toEqual(["path"]);
		expect(getPlaceholders("/{path*}")).toEqual(["path"]);
		expect(getPlaceholders("/[path*]")).toEqual(["path"]);
		expect(getPlaceholders("/[...path]")).toEqual(["path"]);
		expect(getPlaceholders("/:path*")).toEqual(["path"]);
		expect(getPlaceholders("/${...path}")).toEqual(["path"]);
		expect(getPlaceholders("/{{...path}}")).toEqual(["path"]);
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
	test("Object values for catchall placeholders", () => {
		expect(renderTemplate("/files/{...path}", { path: "a/b/c" })).toBe("/files/a/b/c");
		expect(renderTemplate("/files/{path*}", { path: "a/b/c" })).toBe("/files/a/b/c");
		expect(renderTemplate("/files/[...path]", { path: "a/b/c" })).toBe("/files/a/b/c");
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

describe("renderPathTemplate()", () => {
	test("Plain values render unchanged", () => {
		expect(renderPathTemplate("/users/{id}", { id: "123" })).toBe("/users/123");
		expect(renderPathTemplate("/files/{...path}", { path: "a/b/c" })).toBe("/files/a/b/c");
	});
	test("Percent-encodes values so they stay within their path segment", () => {
		expect(renderPathTemplate("/users/{id}", { id: "a/b" })).toBe("/users/a%2Fb");
		expect(renderPathTemplate("/users/{id}", { id: "x?a=1#f" })).toBe("/users/x%3Fa%3D1%23f");
		expect(renderPathTemplate("/users/{id}", { id: "café" })).toBe("/users/caf%C3%A9");
		// Catchall keeps `/` separators, encoding each segment independently.
		expect(renderPathTemplate("/files/{...path}", { path: "a b/c" })).toBe("/files/a%20b/c");
	});
	test("Round-trips losslessly with matchPathTemplate", () => {
		for (const value of ["Dave", "a/b", "x?a=1#f", "café münchen", "50%"]) {
			const path = renderPathTemplate("/users/{id}", { id: value });
			expect(matchPathTemplate("/users/{id}", path)).toEqual({ id: value });
		}
		const path = renderPathTemplate("/files/{...path}", { path: "a b/c/d.txt" });
		expect(matchPathTemplate("/files/{...path}", path)).toEqual({ path: "a b/c/d.txt" });
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
		expect(matchTemplates(["/:a/", "/:a/:b"], "/1/2")).toEqual({ a: "1", b: "2" });
		expect(matchTemplates(new Set(["a"]), "a")).toEqual({});
	});
	test("Correct non-matches", () => {
		expect<TemplateMatches | undefined>(matchTemplates(["/:a/-1-", "/:a/-2-"], "/a/x")).toBe(undefined);
	});
});

describe("matchPathTemplates()", () => {
	test("Correct matches", () => {
		expect(matchPathTemplates(["/:a/", "/:a/:b/"], "/1/2/")).toEqual({ a: "1", b: "2" });
		expect(matchPathTemplates(["/files/{...path}"], "/files/a/b/c")).toEqual({ path: "a/b/c" });
	});
	test("Correct non-matches", () => {
		expect<TemplateMatches | undefined>(matchPathTemplates(["/:a/", "/:a/:b/"], "/a/b/c/")).toBe(undefined);
	});
});
