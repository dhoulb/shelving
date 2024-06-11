import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("CODE_RULE", () => {
	expect(renderMarkup("`A`", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "code", props: { children: "A" } });
	expect(renderMarkup("`AAA`", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "code", props: { children: "AAA" } });
	expect(renderMarkup("``A``", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "code", props: { children: "A" } });
	expect(renderMarkup("``AAA``", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "code", props: { children: "AAA" } });
	expect(renderMarkup("``````AAA``````", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "code", props: { children: "AAA" } });
	expect(renderMarkup("BEFORE `AAA`", OPTIONS, "inline")).toMatchObject([
		"BEFORE ",
		{ $$typeof, type: "code", props: { children: "AAA" } },
	]);
	expect(renderMarkup("`AAA` AFTER", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "code", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non-greedy.
	expect(renderMarkup("`AAA` `AAA`", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "code", props: { children: "AAA" } },
		" ",
		{ $$typeof, type: "code", props: { children: "AAA" } },
	]);

	// Code cannot contain other inline elements.
	expect(renderMarkup("`WORD *STRONG* WORD`", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "code",
		props: { children: "WORD *STRONG* WORD" },
	});
	expect(renderMarkup("`WORD _EM_ WORD`", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "code",
		props: { children: "WORD _EM_ WORD" },
	});
	expect(renderMarkup("`*STRONG*`", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "code", props: { children: "*STRONG*" } });

	// Match even if the opening and closing punctuation is in the middle of the word.
	expect(renderMarkup("TEXT`CODE`", OPTIONS, "inline")).toMatchObject(["TEXT", { $$typeof, type: "code", props: { children: "CODE" } }]);
	expect(renderMarkup("`CODE`TEXT", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "code", props: { children: "CODE" } }, "TEXT"]);
	expect(renderMarkup("TEXT`CODE`TEXT", OPTIONS, "inline")).toMatchObject([
		"TEXT",
		{ $$typeof, type: "code", props: { children: "CODE" } },
		"TEXT",
	]);
});
