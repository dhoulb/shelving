import { expect, test } from "bun:test";
import { MarkupParser } from "../index.js";

const PARSER = new MarkupParser();

test("FENCED_RULE", () => {
	// Basic fenced block.
	expect(PARSER.parse("```\nLINE1\nLINE2\n```")).toMatchObject({
		type: "pre",
		props: {
			children: { type: "code", props: { children: "LINE1\nLINE2" } },
		},
	});
	expect(PARSER.parse("``````\nLINE1\nLINE2\n``````")).toMatchObject({
		type: "pre",
		props: {
			children: { type: "code", props: { children: "LINE1\nLINE2" } },
		},
	});
	expect(PARSER.parse("~~~\nLINE1\nLINE2\n~~~")).toMatchObject({
		type: "pre",
		props: {
			children: { type: "code", props: { children: "LINE1\nLINE2" } },
		},
	});
	expect(PARSER.parse("~~~~~~\nLINE1\nLINE2\n~~~~~~")).toMatchObject({
		type: "pre",
		props: {
			children: { type: "code", props: { children: "LINE1\nLINE2" } },
		},
	});
	expect(PARSER.parse("```\nLINE1\nLINE2")).toMatchObject({
		type: "pre",
		props: {
			children: { type: "code", props: { children: "LINE1\nLINE2" } },
		},
	}); // No close (runs to the end of the string).

	// With filename.
	expect(PARSER.parse("```file.js\nLINE1\nLINE2\n```")).toMatchObject({
		type: "pre",
		props: { children: { type: "code", props: { title: "file.js", children: "LINE1\nLINE2" } } },
	});

	// Whitespace around name is stripped.
	expect(PARSER.parse("```    file.js    \nLINE1\nLINE2\n```")).toMatchObject({
		type: "pre",
		props: { children: { type: "code", props: { title: "file.js", children: "LINE1\nLINE2" } } },
	});
	expect(PARSER.parse("```\t\tfile.js\t\t\nLINE1\nLINE2\n```")).toMatchObject({
		type: "pre",
		props: { children: { type: "code", props: { title: "file.js", children: "LINE1\nLINE2" } } },
	});

	// Newlines before/after are stripped.
	expect(PARSER.parse("\n   \n```\nLINE1\nLINE2\n```\n   \n")).toMatchObject({
		type: "pre",
		props: { children: { type: "code", props: { children: "LINE1\nLINE2" } } },
	});

	// Fenced does not nest other markup.
	expect(PARSER.parse("```\n- ITEM1\n*STRONG*\n```")).toMatchObject({
		type: "pre",
		props: {
			children: { type: "code", props: { children: "- ITEM1\n*STRONG*" } },
		},
	});
});
