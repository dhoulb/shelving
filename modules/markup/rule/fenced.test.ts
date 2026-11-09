import { describe, expect, test } from "bun:test";
import { createFencedRegExp, MarkupParser, parseFencedInfo } from "shelving/markup";

const PARSER = new MarkupParser();

describe("parseFencedInfo()", () => {
	test("empty info", () => {
		expect(parseFencedInfo("")).toEqual({ language: "", flags: [], title: "" });
	});
	test("language only", () => {
		expect(parseFencedInfo("tsx")).toEqual({ language: "tsx", flags: [], title: "" });
	});
	test("language and flags", () => {
		expect(parseFencedInfo("tsx live wide")).toEqual({ language: "tsx", flags: ["live", "wide"], title: "" });
	});
	test("quoted title", () => {
		expect(parseFencedInfo('tsx live "Card with a link"')).toEqual({ language: "tsx", flags: ["live"], title: "Card with a link" });
		expect(parseFencedInfo('"Just a title"')).toEqual({ language: "", flags: [], title: "Just a title" });
	});
	test("file name sets title and language", () => {
		expect(parseFencedInfo("worker.ts")).toEqual({ language: "ts", flags: [], title: "worker.ts" });
		expect(parseFencedInfo("TableWidths.tsx live")).toEqual({ language: "tsx", flags: ["live"], title: "TableWidths.tsx" });
		expect(parseFencedInfo('worker.ts "My worker"')).toEqual({ language: "ts", flags: [], title: "My worker" });
	});
});

describe("createFencedRegExp()", () => {
	test("matches any info by default", () => {
		expect(createFencedRegExp().test("```tsx\nCODE\n```")).toBe(true);
	});
	test("matches only the given info", () => {
		const regexp = createFencedRegExp("tsx live[^\\n]*?");
		expect(regexp.test("```tsx live\nCODE\n```")).toBe(true);
		expect(regexp.test("```tsx\nCODE\n```")).toBe(false);
	});
});

describe("FENCED_RULE", () => {
	test("language does not show as a caption", () => {
		expect(PARSER.parse("```tsx\nCODE\n```")).toMatchObject({
			type: "figure",
			props: { children: { type: "pre", props: { children: { type: "code", props: { children: "CODE" } } } } },
		});
	});
	test("title shows as a caption", () => {
		expect(PARSER.parse('```tsx live "My title"\nCODE\n```')).toMatchObject({
			type: "figure",
			props: { children: [{ type: "figcaption", props: { children: "My title" } }, { type: "pre" }] },
		});
		expect(PARSER.parse("```worker.ts\nCODE\n```")).toMatchObject({
			type: "figure",
			props: { children: [{ type: "figcaption", props: { children: "worker.ts" } }, { type: "pre" }] },
		});
	});
});
