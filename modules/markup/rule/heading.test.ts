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
