import { describe, expect, test } from "bun:test";
import { isValidElement } from "react";
import { renderToString } from "react-dom/server";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

describe("renderMarkup(): Inline rules", () => {
	test("Inline combinations", () => {
		expect(
			renderMarkup(
				"*STRONG* and _EM_ and ++INS++ and ~~DEL~~ and `CODE` and http://google.com and [Google](http://google.com)",
				OPTIONS,
				"inline",
			),
		).toMatchObject([
			{ $$typeof, type: "strong", props: { children: "STRONG" } },
			" and ",
			{ $$typeof, type: "em", props: { children: "EM" } },
			" and ",
			{ $$typeof, type: "ins", props: { children: "INS" } },
			" and ",
			{ $$typeof, type: "del", props: { children: "DEL" } },
			" and ",
			{ $$typeof, type: "code", props: { children: "CODE" } },
			" and ",
			{ $$typeof, type: "a", props: { children: "google.com", href: "http://google.com/" } },
			" and ",
			{ $$typeof, type: "a", props: { children: "Google", href: "http://google.com/" } },
		]);
		expect(
			renderMarkup(
				"BEFORE *STRONG* and _EM_ and ++INS++ and ~~DEL~~ and `CODE` and http://google.com and [Google](http://google.com) AFTER",
				OPTIONS,
				"inline",
			),
		).toMatchObject([
			"BEFORE ",
			{ $$typeof, type: "strong", props: { children: "STRONG" } },
			" and ",
			{ $$typeof, type: "em", props: { children: "EM" } },
			" and ",
			{ $$typeof, type: "ins", props: { children: "INS" } },
			" and ",
			{ $$typeof, type: "del", props: { children: "DEL" } },
			" and ",
			{ $$typeof, type: "code", props: { children: "CODE" } },
			" and ",
			{ $$typeof, type: "a", props: { children: "google.com", href: "http://google.com/" } },
			" and ",
			{ $$typeof, type: "a", props: { children: "Google", href: "http://google.com/" } },
			" AFTER",
		]);
	});
});

describe("renderMarkup(): Block rules", () => {
	test("Block combinations", () => {
		// Testing for things that are all 'block level'.
		const lines = [
			"PARAGRAPH1",
			"```\nLINE1\nLINE2\n```",
			"PARAGRAPH2",
			"- ITEM\n\t- ITEM1\n\t- ITEM2",
			"PARAGRAPH3",
			"1. PARENT1\n\t1111. ITEM1\n\t2222. ITEM2\n2. PARENT2\n3. PARENT3",
			"PARAGRAPH4",
		];
		const elements = [
			{
				$$typeof,
				type: "p",
				props: { children: "PARAGRAPH1" },
			},
			{
				$$typeof,
				type: "pre",
				props: {
					children: { $$typeof, type: "code", props: { children: "LINE1\nLINE2" } },
				},
			},
			{
				$$typeof,
				type: "p",
				props: { children: "PARAGRAPH2" },
			},
			{
				$$typeof,
				type: "ul",
				props: {
					children: [
						{
							$$typeof,
							type: "li",
							props: {
								children: [
									"ITEM",
									{
										$$typeof,
										type: "ul",
										props: {
											children: [
												{ $$typeof, type: "li", props: { children: "ITEM1" } },
												{ $$typeof, type: "li", props: { children: "ITEM2" } },
											],
										},
									},
								],
							},
						},
					],
				},
			},
			{
				$$typeof,
				type: "p",
				props: { children: "PARAGRAPH3" },
			},
			{
				$$typeof,
				type: "ol",
				props: {
					children: [
						{
							$$typeof,
							type: "li",
							props: {
								value: 1,
								children: [
									"PARENT1",
									{
										$$typeof,
										type: "ol",
										props: {
											children: [
												{ $$typeof, type: "li", props: { value: 1111, children: "ITEM1" } },
												{ $$typeof, type: "li", props: { value: 2222, children: "ITEM2" } },
											],
										},
									},
								],
							},
						},
						{ $$typeof, type: "li", props: { value: 2, children: "PARENT2" } },
						{ $$typeof, type: "li", props: { value: 3, children: "PARENT3" } },
					],
				},
			},
			{
				$$typeof,
				type: "p",
				props: { children: "PARAGRAPH4" },
			},
		];

		// Works with two newlines between paragraphs.
		expect(renderMarkup(lines.join("\n\n"), OPTIONS)).toMatchObject(elements);
	});
});

describe("renderMarkup(): React compatibility", () => {
	test("Creates valid React elements including $$typeof security key", () => {
		expect(isValidElement(renderMarkup("abc", OPTIONS))).toBe(true);
		expect(renderMarkup("abc", OPTIONS)).toMatchObject({ $$typeof, type: "p" });
		expect(isValidElement(renderMarkup("- ITEM", OPTIONS))).toBe(true);
		expect(renderMarkup("- ITEM", OPTIONS)).toMatchObject({
			$$typeof,
			type: "ul",
			props: {
				children: [{ $$typeof, type: "li" }],
			},
		});
		expect(isValidElement(renderMarkup("```\nCODE", OPTIONS))).toBe(true);
		expect(renderMarkup("```\nCODE", OPTIONS)).toMatchObject({
			$$typeof,
			type: "pre",
			props: {
				children: { $$typeof, type: "code" },
			},
		});
	});
	test("Generated elements can be rendered without error", () => {
		expect(() => renderToString(renderMarkup("PARAGRAPH", OPTIONS))).not.toThrow();
		expect(() => renderToString(renderMarkup("- ITEM", OPTIONS))).not.toThrow();
		expect(() => renderToString(renderMarkup("```\nCODE", OPTIONS))).not.toThrow();
	});
});

describe("renderMarkup(): Unique keys", () => {
	test("Key increments appropriately.", () => {
		expect(renderMarkup("GAP **STRONG** GAP `CODE` GAP __ITALIC__ GAP", OPTIONS, "inline")).toMatchObject([
			"GAP ",
			{ $$typeof, type: "strong", key: "4" },
			" GAP ",
			{ $$typeof, type: "code", key: "19" },
			" GAP ",
			{ $$typeof, type: "em", key: "30" },
			" GAP",
		]);
	});
});

describe("renderMarkup(): Weird cases", () => {
	test("Empty string is `null`", () => {
		expect(renderMarkup("", OPTIONS)).toBe(null);
	});
});
