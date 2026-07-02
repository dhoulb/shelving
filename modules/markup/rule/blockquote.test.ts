import { expect, test } from "bun:test";
import { MarkupParser } from "shelving/markup";

const PARSER = new MarkupParser();

test("BLOCKQUOTE_RULE", () => {
	// Single line.
	expect(PARSER.parse(">QUOTE")).toMatchObject({
		type: "blockquote",
		props: { children: { type: "p", props: { children: "QUOTE" } } },
	});
	expect(PARSER.parse("> QUOTE")).toMatchObject({
		type: "blockquote",
		props: { children: { type: "p", props: { children: "QUOTE" } } },
	});

	// Multiline.
	expect(PARSER.parse(">QUOTE1\n>\n>QUOTE2")).toMatchObject({
		type: "blockquote",
		props: {
			children: [
				{ type: "p", props: { children: "QUOTE1" } },
				{ type: "p", props: { children: "QUOTE2" } },
			],
		},
	});
	expect(PARSER.parse("> QUOTE1\n>\n> QUOTE2")).toMatchObject({
		type: "blockquote",
		props: {
			children: [
				{ type: "p", props: { children: "QUOTE1" } },
				{ type: "p", props: { children: "QUOTE2" } },
			],
		},
	});

	// Empty.
	expect(PARSER.parse(">")).toMatchObject({
		type: "blockquote",
		props: { children: null },
	});

	// Whitespace is stripped.
	expect(PARSER.parse(">    QUOTE    ")).toMatchObject({
		type: "blockquote",
		props: { children: { type: "p", props: { children: "QUOTE" } } },
	});
	expect(PARSER.parse(">\t\tQUOTE\t\t")).toMatchObject({
		type: "blockquote",
		props: { children: { type: "p", props: { children: "QUOTE" } } },
	});
	expect(PARSER.parse("\n    \n> QUOTE\n    \n")).toMatchObject({
		type: "blockquote",
		props: { children: { type: "p", props: { children: "QUOTE" } } },
	});

	// Multiple quotes.
	expect(PARSER.parse("> QUOTE1\n\n> QUOTE2")).toMatchObject([
		{
			type: "blockquote",
			props: { children: { type: "p", props: { children: "QUOTE1" } } },
		},
		{
			type: "blockquote",
			props: { children: { type: "p", props: { children: "QUOTE2" } } },
		},
	]);
});
