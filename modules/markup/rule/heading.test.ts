import { expect, test } from "bun:test";
import { MarkupParser } from "shelving/markup";

const PARSER = new MarkupParser();

test("HEADING_RULE", () => {
	expect(PARSER.parse("# HEADING")).toMatchObject({ type: "h1", props: { children: "HEADING" } });
	expect(PARSER.parse("## HEADING")).toMatchObject({ type: "h2", props: { children: "HEADING" } });
	expect(PARSER.parse("###### HEADING")).toMatchObject({ type: "h6", props: { children: "HEADING" } });

	// Whitespace at start/end of heading is trimmed.
	expect(PARSER.parse("#    HEADING    ")).toMatchObject({ type: "h1", props: { children: "HEADING" } });
	expect(PARSER.parse("#\t\tHEADING\t\t")).toMatchObject({ type: "h1", props: { children: "HEADING" } });

	// Newlines before/after are stripped.
	expect(PARSER.parse("\n    \n# HEADING\n    \n")).toMatchObject({ type: "h1", props: { children: "HEADING" } });
});

test("HEADING_RULE adds a slug id", () => {
	// The heading text is slugged into an `id` so same-page `#anchor` links resolve.
	expect(PARSER.parse("## React integration")).toMatchObject({ type: "h2", props: { id: "react-integration" } });
	expect(PARSER.parse("### Cache keys")).toMatchObject({ type: "h3", props: { id: "cache-keys" } });

	// The raw title is slugged before inline parsing, so punctuation (backticks, parens) drops out.
	expect(PARSER.parse("### `call()` vs `refresh()`")).toMatchObject({ type: "h3", props: { id: "call-vs-refresh" } });

	// A heading that slugs to nothing gets no `id`.
	expect(PARSER.parse("# ---")).toMatchObject({ type: "h1", props: { id: undefined } });
});
