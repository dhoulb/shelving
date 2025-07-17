import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.transitional.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("LINEBREAK", () => {
	expect(renderMarkup("WORD1\nWORD2", OPTIONS, "inline")).toMatchObject([
		"WORD1",
		{
			$$typeof,
			type: "br",
			props: {},
		},
		"WORD2",
	]);

	// Linebreaks trim leading and trailing whitespace.
	expect(renderMarkup("WORD1    \n     WORD2", OPTIONS, "inline")).toMatchObject([
		"WORD1",
		{
			$$typeof,
			type: "br",
			props: {},
		},
		"WORD2",
	]);
	expect(renderMarkup("WORD1\t\t\n\t\tWORD2", OPTIONS, "inline")).toMatchObject([
		"WORD1",
		{
			$$typeof,
			type: "br",
			props: {},
		},
		"WORD2",
	]);

	// Linebreaks match in "list" context.
	expect(renderMarkup("WORD1\nWORD2", OPTIONS, "list")).toMatchObject([
		"WORD1",
		{
			$$typeof,
			type: "br",
			props: {},
		},
		"WORD2",
	]);
});
