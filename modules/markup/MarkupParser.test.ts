import { describe, expect, test } from "bun:test";
import { isValidElement } from "react";
import { renderToString } from "react-dom/server";
import { MarkupParser } from "shelving/markup";

const PARSER = new MarkupParser();

describe("MarkupParser", () => {
	describe("parse()", () => {
		test("Inline combinations", () => {
			expect(
				PARSER.parse(
					"*STRONG* and _EM_ and ++INS++ and ~~DEL~~ and `CODE` and http://google.com and [Google](http://google.com)",
					"inline",
				),
			).toMatchObject([
				{ type: "strong", props: { children: "STRONG" } },
				" and ",
				{ type: "em", props: { children: "EM" } },
				" and ",
				{ type: "ins", props: { children: "INS" } },
				" and ",
				{ type: "del", props: { children: "DEL" } },
				" and ",
				{ type: "code", props: { children: "CODE" } },
				" and ",
				{ type: "a", props: { children: "google.com", href: "http://google.com/" } },
				" and ",
				{ type: "a", props: { children: "Google", href: "http://google.com/" } },
			]);
			expect(
				PARSER.parse(
					"BEFORE *STRONG* and _EM_ and ++INS++ and ~~DEL~~ and `CODE` and http://google.com and [Google](http://google.com) AFTER",
					"inline",
				),
			).toMatchObject([
				"BEFORE ",
				{ type: "strong", props: { children: "STRONG" } },
				" and ",
				{ type: "em", props: { children: "EM" } },
				" and ",
				{ type: "ins", props: { children: "INS" } },
				" and ",
				{ type: "del", props: { children: "DEL" } },
				" and ",
				{ type: "code", props: { children: "CODE" } },
				" and ",
				{ type: "a", props: { children: "google.com", href: "http://google.com/" } },
				" and ",
				{ type: "a", props: { children: "Google", href: "http://google.com/" } },
				" AFTER",
			]);
		});
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
					type: "p",
					props: { children: "PARAGRAPH1" },
				},
				{
					type: "figure",
					props: {
						children: { type: "pre", props: { children: { type: "code", props: { children: "LINE1\nLINE2" } } } },
					},
				},
				{
					type: "p",
					props: { children: "PARAGRAPH2" },
				},
				{
					type: "ul",
					props: {
						children: [
							{
								type: "li",
								props: {
									children: [
										"ITEM",
										{
											type: "ul",
											props: {
												children: [
													{ type: "li", props: { children: "ITEM1" } },
													{ type: "li", props: { children: "ITEM2" } },
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
					type: "p",
					props: { children: "PARAGRAPH3" },
				},
				{
					type: "ol",
					props: {
						children: [
							{
								type: "li",
								props: {
									value: 1,
									children: [
										"PARENT1",
										{
											type: "ol",
											props: {
												children: [
													{ type: "li", props: { value: 1111, children: "ITEM1" } },
													{ type: "li", props: { value: 2222, children: "ITEM2" } },
												],
											},
										},
									],
								},
							},
							{ type: "li", props: { value: 2, children: "PARENT2" } },
							{ type: "li", props: { value: 3, children: "PARENT3" } },
						],
					},
				},
				{
					type: "p",
					props: { children: "PARAGRAPH4" },
				},
			];
			// Works with two newlines between paragraphs.
			expect(PARSER.parse(lines.join("\n\n"))).toMatchObject(elements);
		});
		test("React compatibility", () => {
			expect(isValidElement(PARSER.parse("abc"))).toBe(true);
			expect(PARSER.parse("abc")).toMatchObject({ type: "p" });
			expect(isValidElement(PARSER.parse("- ITEM"))).toBe(true);
			expect(PARSER.parse("- ITEM")).toMatchObject({
				type: "ul",
				props: {
					children: [{ type: "li" }],
				},
			});
			expect(isValidElement(PARSER.parse("```\nCODE"))).toBe(true);
			expect(PARSER.parse("```\nCODE")).toMatchObject({
				type: "figure",
				props: {
					children: { type: "pre", props: { children: { type: "code" } } },
				},
			});
			expect(() => renderToString(PARSER.parse("PARAGRAPH"))).not.toThrow();
			expect(() => renderToString(PARSER.parse("- ITEM"))).not.toThrow();
			expect(() => renderToString(PARSER.parse("```\nCODE"))).not.toThrow();
		});
		test("Key increments appropriately.", () => {
			expect(PARSER.parse("GAP **STRONG** GAP `CODE` GAP __ITALIC__ GAP", "inline")).toMatchObject([
				"GAP ",
				{ type: "strong", key: "4" },
				" GAP ",
				{ type: "code", key: "19" },
				" GAP ",
				{ type: "em", key: "30" },
				" GAP",
			]);
		});
		test("Edge cases", () => {
			expect(PARSER.parse("")).toBe(null);
		});
	});
});
