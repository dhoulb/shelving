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

// Recursively count `<blockquote>` elements in a rendered node tree.
function countBlockquotes(node: unknown): number {
	if (Array.isArray(node)) return node.reduce((sum: number, child) => sum + countBlockquotes(child), 0);
	if (!node || typeof node !== "object") return 0;
	const { type, props } = node as { type?: unknown; props?: { children?: unknown } };
	return (type === "blockquote" ? 1 : 0) + countBlockquotes(props?.children);
}

test("BLOCKQUOTE_RULE caps nesting depth at 10 levels", () => {
	// Shallow nesting is unaffected.
	expect(countBlockquotes(PARSER.parse(`${">".repeat(3)} x`))).toBe(3);
	// Deep nesting stops at exactly 10 levels instead of recursing once per `>`.
	expect(countBlockquotes(PARSER.parse(`${">".repeat(10)} x`))).toBe(10);
	expect(countBlockquotes(PARSER.parse(`${">".repeat(50)} x`))).toBe(10);
	// Pathological input must not overflow the call stack.
	expect(() => PARSER.parse(">".repeat(50000))).not.toThrow();
});
