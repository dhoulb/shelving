import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.transitional.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("HEADING_RULE", () => {
	expect(renderMarkup("# HEADING", OPTIONS)).toMatchObject({ $$typeof, type: "h1", props: { children: "HEADING" } });
	expect(renderMarkup("## HEADING", OPTIONS)).toMatchObject({ $$typeof, type: "h2", props: { children: "HEADING" } });
	expect(renderMarkup("###### HEADING", OPTIONS)).toMatchObject({ $$typeof, type: "h6", props: { children: "HEADING" } });

	// Whitespace at start/end of heading is trimmed.
	expect(renderMarkup("#    HEADING    ", OPTIONS)).toMatchObject({ $$typeof, type: "h1", props: { children: "HEADING" } });
	expect(renderMarkup("#\t\tHEADING\t\t", OPTIONS)).toMatchObject({ $$typeof, type: "h1", props: { children: "HEADING" } });

	// Newlines before/after are stripped.
	expect(renderMarkup("\n    \n# HEADING\n    \n", OPTIONS)).toMatchObject({ $$typeof, type: "h1", props: { children: "HEADING" } });
});
