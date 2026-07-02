import { expect, test } from "bun:test";
import { MarkupParser } from "shelving/markup";

const PARSER = new MarkupParser();

test("CODE_RULE", () => {
	expect(PARSER.parse("`A`", "inline")).toMatchObject({ type: "code", props: { children: "A" } });
	expect(PARSER.parse("`AAA`", "inline")).toMatchObject({ type: "code", props: { children: "AAA" } });
	expect(PARSER.parse("``A``", "inline")).toMatchObject({ type: "code", props: { children: "A" } });
	expect(PARSER.parse("``AAA``", "inline")).toMatchObject({ type: "code", props: { children: "AAA" } });
	expect(PARSER.parse("``````AAA``````", "inline")).toMatchObject({ type: "code", props: { children: "AAA" } });
	expect(PARSER.parse("BEFORE `AAA`", "inline")).toMatchObject(["BEFORE ", { type: "code", props: { children: "AAA" } }]);
	expect(PARSER.parse("`AAA` AFTER", "inline")).toMatchObject([{ type: "code", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non-greedy.
	expect(PARSER.parse("`AAA` `AAA`", "inline")).toMatchObject([
		{ type: "code", props: { children: "AAA" } },
		" ",
		{ type: "code", props: { children: "AAA" } },
	]);

	// Code cannot contain other inline elements.
	expect(PARSER.parse("`WORD *STRONG* WORD`", "inline")).toMatchObject({
		type: "code",
		props: { children: "WORD *STRONG* WORD" },
	});
	expect(PARSER.parse("`WORD _EM_ WORD`", "inline")).toMatchObject({
		type: "code",
		props: { children: "WORD _EM_ WORD" },
	});
	expect(PARSER.parse("`*STRONG*`", "inline")).toMatchObject({ type: "code", props: { children: "*STRONG*" } });

	// Match even if the opening and closing punctuation is in the middle of the word.
	expect(PARSER.parse("TEXT`CODE`", "inline")).toMatchObject(["TEXT", { type: "code", props: { children: "CODE" } }]);
	expect(PARSER.parse("`CODE`TEXT", "inline")).toMatchObject([{ type: "code", props: { children: "CODE" } }, "TEXT"]);
	expect(PARSER.parse("TEXT`CODE`TEXT", "inline")).toMatchObject(["TEXT", { type: "code", props: { children: "CODE" } }, "TEXT"]);
});
