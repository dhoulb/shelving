import { expect, test } from "bun:test";
import { MarkupParser } from "../index.js";

const PARSER = new MarkupParser();

test("PARAGRAPH", () => {
	// Single line.
	expect(PARSER.parse("PARAGRAPH")).toMatchObject({
		type: "p",
		props: { children: "PARAGRAPH" },
	});

	// Multiline.
	expect(PARSER.parse("PARAGRAPH1\n\nPARAGRAPH2")).toMatchObject([
		{ type: "p", props: { children: "PARAGRAPH1" } },
		{ type: "p", props: { children: "PARAGRAPH2" } },
	]);

	// Paragraphs trim leading and trailing whitespace.
	expect(PARSER.parse("    WORD    WORD    ")).toMatchObject({
		type: "p",
		props: { children: "WORD    WORD" },
	});
	expect(PARSER.parse("\t\tWORD\t\tWORD\t\t")).toMatchObject({
		type: "p",
		props: { children: "WORD\t\tWORD" },
	});

	// Newlines before/after are stripped.
	expect(PARSER.parse("\n\nWORD    WORD\n\n")).toMatchObject({
		type: "p",
		props: { children: "WORD    WORD" },
	});

	// Paragraphs can contain inlines.
	expect(PARSER.parse("BEFORE **STRONG** AFTER")).toMatchObject({
		type: "p",
		props: {
			children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"],
		},
	});

	// Blocks immediately after paragraphs break those paragraphs early.
	expect(PARSER.parse("PARAGRAPH\n- ITEM")).toMatchObject([
		{
			type: "p",
			props: { children: "PARAGRAPH" },
		},
		{
			type: "ul",
			props: {
				children: [{ type: "li", props: { children: "ITEM" } }],
			},
		},
	]);
	expect(PARSER.parse("PARAGRAPH\n1. ITEM")).toMatchObject([
		{
			type: "p",
			props: { children: "PARAGRAPH" },
		},
		{
			type: "ol",
			props: {
				children: [{ type: "li", props: { value: 1, children: "ITEM" } }],
			},
		},
	]);
	expect(PARSER.parse("PARAGRAPH\n> QUOTE")).toMatchObject([
		{
			type: "p",
			props: { children: "PARAGRAPH" },
		},
		{
			type: "blockquote",
			props: { children: { type: "p", props: { children: "QUOTE" } } },
		},
	]);
	expect(PARSER.parse("PARAGRAPH\n```\nLINE1\nLINE2\n```")).toMatchObject([
		{
			type: "p",
			props: { children: "PARAGRAPH" },
		},
		{
			type: "figure",
			props: {
				children: { type: "pre", props: { children: { type: "code", props: { children: "LINE1\nLINE2" } } } },
			},
		},
	]);
});
