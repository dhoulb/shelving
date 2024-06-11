import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("PARAGRAPH", () => {
	// Single line.
	expect(renderMarkup("PARAGRAPH", OPTIONS)).toMatchObject({
		$$typeof,
		type: "p",
		props: { children: "PARAGRAPH" },
	});

	// Multiline.
	expect(renderMarkup("PARAGRAPH1\n\nPARAGRAPH2", OPTIONS)).toMatchObject([
		{ $$typeof, type: "p", props: { children: "PARAGRAPH1" } },
		{ $$typeof, type: "p", props: { children: "PARAGRAPH2" } },
	]);

	// Paragraphs trim leading and trailing whitespace.
	expect(renderMarkup("    WORD    WORD    ", OPTIONS)).toMatchObject({
		$$typeof,
		type: "p",
		props: { children: "WORD    WORD" },
	});
	expect(renderMarkup("\t\tWORD\t\tWORD\t\t", OPTIONS)).toMatchObject({
		$$typeof,
		type: "p",
		props: { children: "WORD\t\tWORD" },
	});

	// Newlines before/after are stripped.
	expect(renderMarkup("\n\nWORD    WORD\n\n", OPTIONS)).toMatchObject({
		$$typeof,
		type: "p",
		props: { children: "WORD    WORD" },
	});

	// Paragraphs can contain inlines.
	expect(renderMarkup("BEFORE **STRONG** AFTER", OPTIONS)).toMatchObject({
		$$typeof,
		type: "p",
		props: {
			children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"],
		},
	});

	// Blocks immediately after paragraphs break those paragraphs early.
	expect(renderMarkup("PARAGRAPH\n- ITEM", OPTIONS)).toMatchObject([
		{
			$$typeof,
			type: "p",
			props: { children: "PARAGRAPH" },
		},
		{
			$$typeof,
			type: "ul",
			props: {
				children: [{ $$typeof, type: "li", props: { children: "ITEM" } }],
			},
		},
	]);
	expect(renderMarkup("PARAGRAPH\n1. ITEM", OPTIONS)).toMatchObject([
		{
			$$typeof,
			type: "p",
			props: { children: "PARAGRAPH" },
		},
		{
			$$typeof,
			type: "ol",
			props: {
				children: [{ $$typeof, type: "li", props: { value: 1, children: "ITEM" } }],
			},
		},
	]);
	expect(renderMarkup("PARAGRAPH\n> QUOTE", OPTIONS)).toMatchObject([
		{
			$$typeof,
			type: "p",
			props: { children: "PARAGRAPH" },
		},
		{
			$$typeof,
			type: "blockquote",
			props: { children: { $$typeof, type: "p", props: { children: "QUOTE" } } },
		},
	]);
	expect(renderMarkup("PARAGRAPH\n```\nLINE1\nLINE2\n```", OPTIONS)).toMatchObject([
		{
			$$typeof,
			type: "p",
			props: { children: "PARAGRAPH" },
		},
		{
			$$typeof,
			type: "pre",
			props: {
				children: { $$typeof, type: "code", props: { children: "LINE1\nLINE2" } },
			},
		},
	]);
});
