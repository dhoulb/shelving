import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.transitional.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("BLOCKQUOTE_RULE", () => {
	// Single line.
	expect(renderMarkup(">QUOTE", OPTIONS)).toMatchObject({
		$$typeof,
		type: "blockquote",
		props: { children: { $$typeof, type: "p", props: { children: "QUOTE" } } },
	});
	expect(renderMarkup("> QUOTE", OPTIONS)).toMatchObject({
		$$typeof,
		type: "blockquote",
		props: { children: { $$typeof, type: "p", props: { children: "QUOTE" } } },
	});

	// Multiline.
	expect(renderMarkup(">QUOTE1\n>\n>QUOTE2", OPTIONS)).toMatchObject({
		$$typeof,
		type: "blockquote",
		props: {
			children: [
				{ $$typeof, type: "p", props: { children: "QUOTE1" } },
				{ $$typeof, type: "p", props: { children: "QUOTE2" } },
			],
		},
	});
	expect(renderMarkup("> QUOTE1\n>\n> QUOTE2", OPTIONS)).toMatchObject({
		$$typeof,
		type: "blockquote",
		props: {
			children: [
				{ $$typeof, type: "p", props: { children: "QUOTE1" } },
				{ $$typeof, type: "p", props: { children: "QUOTE2" } },
			],
		},
	});

	// Empty.
	expect(renderMarkup(">", OPTIONS)).toMatchObject({
		$$typeof,
		type: "blockquote",
		props: { children: null },
	});

	// Whitespace is stripped.
	expect(renderMarkup(">    QUOTE    ", OPTIONS)).toMatchObject({
		$$typeof,
		type: "blockquote",
		props: { children: { $$typeof, type: "p", props: { children: "QUOTE" } } },
	});
	expect(renderMarkup(">\t\tQUOTE\t\t", OPTIONS)).toMatchObject({
		$$typeof,
		type: "blockquote",
		props: { children: { $$typeof, type: "p", props: { children: "QUOTE" } } },
	});
	expect(renderMarkup("\n    \n> QUOTE\n    \n", OPTIONS)).toMatchObject({
		$$typeof,
		type: "blockquote",
		props: { children: { $$typeof, type: "p", props: { children: "QUOTE" } } },
	});

	// Multiple quotes.
	expect(renderMarkup("> QUOTE1\n\n> QUOTE2", OPTIONS)).toMatchObject([
		{
			$$typeof,
			type: "blockquote",
			props: { children: { $$typeof, type: "p", props: { children: "QUOTE1" } } },
		},
		{
			$$typeof,
			type: "blockquote",
			props: { children: { $$typeof, type: "p", props: { children: "QUOTE2" } } },
		},
	]);
});
