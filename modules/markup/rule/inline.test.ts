import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.transitional.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("INLINE_RULE <strong>", () => {
	expect(renderMarkup("*A*", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "strong", props: { children: "A" } });
	expect(renderMarkup("**A**", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "strong", props: { children: "A" } });
	expect(renderMarkup("******A******", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "strong", props: { children: "A" } });
	expect(renderMarkup("*AAA BBB*", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "strong", props: { children: "AAA BBB" } });
	expect(renderMarkup("**AAA BBB**", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "strong", props: { children: "AAA BBB" } });
	expect(renderMarkup("******AAA BBB******", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "strong",
		props: { children: "AAA BBB" },
	});
	expect(renderMarkup("BEFORE *AAA*", OPTIONS, "inline")).toMatchObject([
		"BEFORE ",
		{ $$typeof, type: "strong", props: { children: "AAA" } },
	]);
	expect(renderMarkup("*AAA* AFTER", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "strong", props: { children: "AAA" } },
		" AFTER",
	]);

	// Matching is non-greedy.
	expect(renderMarkup("*AAA* *AAA*", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "strong", props: { children: "AAA" } },
		" ",
		{ $$typeof, type: "strong", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(renderMarkup("*BEFORE _EM_ AFTER*", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "strong",
		props: { children: ["BEFORE ", { $$typeof, type: "em", props: { children: "EM" } }, " AFTER"] },
	});
	expect(renderMarkup("*_EM_*", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "strong",
		props: { children: { $$typeof, type: "em", props: { children: "EM" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	expect(renderMarkup("TEXT*STRONG*", OPTIONS, "inline")).toMatchObject([
		"TEXT",
		{ $$typeof, type: "strong", props: { children: "STRONG" } },
	]);
	expect(renderMarkup("*STRONG*TEXT", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "strong", props: { children: "STRONG" } },
		"TEXT",
	]);
	expect(renderMarkup("TEXT*STRONG*TEXT", OPTIONS, "inline")).toMatchObject([
		"TEXT",
		{ $$typeof, type: "strong", props: { children: "STRONG" } },
		"TEXT",
	]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(renderMarkup("*AAA *", OPTIONS, "inline")).toBe("*AAA *");
	expect(renderMarkup("* AAA*", OPTIONS, "inline")).toBe("* AAA*");
	expect(renderMarkup("* AAA *", OPTIONS, "inline")).toBe("* AAA *");
	expect(renderMarkup("**AAA **", OPTIONS, "inline")).toBe("**AAA **");
	expect(renderMarkup("** AAA**", OPTIONS, "inline")).toBe("** AAA**");
	expect(renderMarkup("** AAA **", OPTIONS, "inline")).toBe("** AAA **");
});

test("INLINE_RULE <em>", () => {
	expect(renderMarkup("_A_", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "em", props: { children: "A" } });
	expect(renderMarkup("__A__", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "em", props: { children: "A" } });
	expect(renderMarkup("______A______", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "em", props: { children: "A" } });
	expect(renderMarkup("_AAA BBB_", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "em", props: { children: "AAA BBB" } });
	expect(renderMarkup("__AAA BBB__", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "em", props: { children: "AAA BBB" } });
	expect(renderMarkup("______AAA BBB______", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "em", props: { children: "AAA BBB" } });
	expect(renderMarkup("BEFORE _AAA_", OPTIONS, "inline")).toMatchObject(["BEFORE ", { $$typeof, type: "em", props: { children: "AAA" } }]);
	expect(renderMarkup("_AAA_ AFTER", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "em", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non-greedy.
	expect(renderMarkup("_AAA_ _AAA_", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "em", props: { children: "AAA" } },
		" ",
		{ $$typeof, type: "em", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(renderMarkup("_BEFORE *STRONG* AFTER_", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "em",
		props: { children: ["BEFORE ", { $$typeof, type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(renderMarkup("_*STRONG*_", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "em",
		props: { children: { $$typeof, type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	expect(renderMarkup("TEXT_EM_", OPTIONS, "inline")).toMatchObject(["TEXT", { $$typeof, type: "em", props: { children: "EM" } }]);
	expect(renderMarkup("_EM_TEXT", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "em", props: { children: "EM" } }, "TEXT"]);
	expect(renderMarkup("TEXT_EM_TEXT", OPTIONS, "inline")).toMatchObject([
		"TEXT",
		{ $$typeof, type: "em", props: { children: "EM" } },
		"TEXT",
	]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(renderMarkup("_AAA _", OPTIONS, "inline")).toBe("_AAA _");
	expect(renderMarkup("_ AAA_", OPTIONS, "inline")).toBe("_ AAA_");
	expect(renderMarkup("_ AAA _", OPTIONS, "inline")).toBe("_ AAA _");
	expect(renderMarkup("__AAA __", OPTIONS, "inline")).toBe("__AAA __");
	expect(renderMarkup("__ AAA__", OPTIONS, "inline")).toBe("__ AAA__");
	expect(renderMarkup("__ AAA __", OPTIONS, "inline")).toBe("__ AAA __");
});

test("INLINE_RULE <ins>", () => {
	expect(renderMarkup("+A+", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "ins", props: { children: "A" } });
	expect(renderMarkup("++A++", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "ins", props: { children: "A" } });
	expect(renderMarkup("++++++A++++++", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "ins", props: { children: "A" } });
	expect(renderMarkup("+AAA BBB+", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "ins", props: { children: "AAA BBB" } });
	expect(renderMarkup("++AAA BBB++", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "ins", props: { children: "AAA BBB" } });
	expect(renderMarkup("++++++AAA BBB++++++", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "ins", props: { children: "AAA BBB" } });
	expect(renderMarkup("BEFORE ++AAA++", OPTIONS, "inline")).toMatchObject([
		"BEFORE ",
		{ $$typeof, type: "ins", props: { children: "AAA" } },
	]);
	expect(renderMarkup("++AAA++ AFTER", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "ins", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non-greedy.
	expect(renderMarkup("++AAA++ ++AAA++", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "ins", props: { children: "AAA" } },
		" ",
		{ $$typeof, type: "ins", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(renderMarkup("++BEFORE *STRONG* AFTER++", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "ins",
		props: { children: ["BEFORE ", { $$typeof, type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(renderMarkup("++*STRONG*++", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "ins",
		props: { children: { $$typeof, type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	expect(renderMarkup("TEXT++INS++", OPTIONS, "inline")).toMatchObject(["TEXT", { $$typeof, type: "ins", props: { children: "INS" } }]);
	expect(renderMarkup("++INS++TEXT", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "ins", props: { children: "INS" } }, "TEXT"]);
	expect(renderMarkup("TEXT++INS++TEXT", OPTIONS, "inline")).toMatchObject([
		"TEXT",
		{ $$typeof, type: "ins", props: { children: "INS" } },
		"TEXT",
	]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(renderMarkup("++AAA ++", OPTIONS, "inline")).toBe("++AAA ++");
	expect(renderMarkup("++ AAA++", OPTIONS, "inline")).toBe("++ AAA++");
	expect(renderMarkup("++ AAA ++", OPTIONS, "inline")).toBe("++ AAA ++");
});

test("INLINE_RULE <del> (with tilde)", () => {
	expect(renderMarkup("~A~", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "A" } });
	expect(renderMarkup("~~A~~", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "A" } });
	expect(renderMarkup("~~~~~~A~~~~~~", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "A" } });
	expect(renderMarkup("~AAA BBB~", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "AAA BBB" } });
	expect(renderMarkup("~~AAA BBB~~", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "AAA BBB" } });
	expect(renderMarkup("~~~~~~AAA BBB~~~~~~", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "AAA BBB" } });
	expect(renderMarkup("BEFORE ~~AAA~~", OPTIONS, "inline")).toMatchObject([
		"BEFORE ",
		{ $$typeof, type: "del", props: { children: "AAA" } },
	]);
	expect(renderMarkup("~~AAA~~ AFTER", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "del", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non~~greedy.
	expect(renderMarkup("~~AAA~~ ~~AAA~~", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "del", props: { children: "AAA" } },
		" ",
		{ $$typeof, type: "del", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(renderMarkup("~~BEFORE *STRONG* AFTER~~", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "del",
		props: { children: ["BEFORE ", { $$typeof, type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(renderMarkup("~~*STRONG*~~", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "del",
		props: { children: { $$typeof, type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	expect(renderMarkup("TEXT~~DEL~~", OPTIONS, "inline")).toMatchObject(["TEXT", { $$typeof, type: "del", props: { children: "DEL" } }]);
	expect(renderMarkup("~~DEL~~TEXT", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "del", props: { children: "DEL" } }, "TEXT"]);
	expect(renderMarkup("TEXT~~DEL~~TEXT", OPTIONS, "inline")).toMatchObject([
		"TEXT",
		{ $$typeof, type: "del", props: { children: "DEL" } },
		"TEXT",
	]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(renderMarkup("~AAA ~", OPTIONS, "inline")).toBe("~AAA ~");
	expect(renderMarkup("~ AAA~", OPTIONS, "inline")).toBe("~ AAA~");
	expect(renderMarkup("~ AAA ~", OPTIONS, "inline")).toBe("~ AAA ~");
	expect(renderMarkup("~~AAA ~~", OPTIONS, "inline")).toBe("~~AAA ~~");
	expect(renderMarkup("~~ AAA~~", OPTIONS, "inline")).toBe("~~ AAA~~");
	expect(renderMarkup("~~ AAA ~~", OPTIONS, "inline")).toBe("~~ AAA ~~");
});

test("INLINE_RULE <del> (with hyphen)", () => {
	expect(renderMarkup("-A-", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "A" } });
	expect(renderMarkup("--A--", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "A" } });
	expect(renderMarkup("------A------", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "A" } });
	expect(renderMarkup("-AAA BBB-", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "AAA BBB" } });
	expect(renderMarkup("--AAA BBB--", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "AAA BBB" } });
	expect(renderMarkup("------AAA BBB------", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "del", props: { children: "AAA BBB" } });
	expect(renderMarkup("BEFORE --AAA--", OPTIONS, "inline")).toMatchObject([
		"BEFORE ",
		{ $$typeof, type: "del", props: { children: "AAA" } },
	]);
	expect(renderMarkup("--AAA-- AFTER", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "del", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non--greedy.
	expect(renderMarkup("--AAA-- --AAA--", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "del", props: { children: "AAA" } },
		" ",
		{ $$typeof, type: "del", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(renderMarkup("--BEFORE *STRONG* AFTER--", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "del",
		props: { children: ["BEFORE ", { $$typeof, type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(renderMarkup("--*STRONG*--", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "del",
		props: { children: { $$typeof, type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	expect(renderMarkup("TEXT--DEL--", OPTIONS, "inline")).toMatchObject(["TEXT", { $$typeof, type: "del", props: { children: "DEL" } }]);
	expect(renderMarkup("--DEL--TEXT", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "del", props: { children: "DEL" } }, "TEXT"]);
	expect(renderMarkup("TEXT--DEL--TEXT", OPTIONS, "inline")).toMatchObject([
		"TEXT",
		{ $$typeof, type: "del", props: { children: "DEL" } },
		"TEXT",
	]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(renderMarkup("-AAA -", OPTIONS, "inline")).toBe("-AAA -");
	expect(renderMarkup("- AAA-", OPTIONS, "inline")).toBe("- AAA-");
	expect(renderMarkup("- AAA -", OPTIONS, "inline")).toBe("- AAA -");
	expect(renderMarkup("--AAA --", OPTIONS, "inline")).toBe("--AAA --");
	expect(renderMarkup("-- AAA--", OPTIONS, "inline")).toBe("-- AAA--");
	expect(renderMarkup("-- AAA --", OPTIONS, "inline")).toBe("-- AAA --");
});

test("INLINE_RULE <mark>", () => {
	expect(renderMarkup("=A=", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "mark", props: { children: "A" } });
	expect(renderMarkup("==A==", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "mark", props: { children: "A" } });
	expect(renderMarkup("======A======", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "mark", props: { children: "A" } });
	expect(renderMarkup("=AAA BBB=", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "mark", props: { children: "AAA BBB" } });
	expect(renderMarkup("==AAA BBB==", OPTIONS, "inline")).toMatchObject({ $$typeof, type: "mark", props: { children: "AAA BBB" } });
	expect(renderMarkup("======AAA BBB======", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "mark",
		props: { children: "AAA BBB" },
	});
	expect(renderMarkup("BEFORE ==AAA==", OPTIONS, "inline")).toMatchObject([
		"BEFORE ",
		{ $$typeof, type: "mark", props: { children: "AAA" } },
	]);
	expect(renderMarkup("==AAA== AFTER", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "mark", props: { children: "AAA" } },
		" AFTER",
	]);

	// Matching is non==greedy.
	expect(renderMarkup("==AAA== ==AAA==", OPTIONS, "inline")).toMatchObject([
		{ $$typeof, type: "mark", props: { children: "AAA" } },
		" ",
		{ $$typeof, type: "mark", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(renderMarkup("==BEFORE *STRONG* AFTER==", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "mark",
		props: { children: ["BEFORE ", { $$typeof, type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(renderMarkup("==*STRONG*==", OPTIONS, "inline")).toMatchObject({
		$$typeof,
		type: "mark",
		props: { children: { $$typeof, type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	expect(renderMarkup("TEXT==DEL==", OPTIONS, "inline")).toMatchObject(["TEXT", { $$typeof, type: "mark", props: { children: "DEL" } }]);
	expect(renderMarkup("==DEL==TEXT", OPTIONS, "inline")).toMatchObject([{ $$typeof, type: "mark", props: { children: "DEL" } }, "TEXT"]);
	expect(renderMarkup("TEXT==DEL==TEXT", OPTIONS, "inline")).toMatchObject([
		"TEXT",
		{ $$typeof, type: "mark", props: { children: "DEL" } },
		"TEXT",
	]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(renderMarkup("=AAA =", OPTIONS, "inline")).toBe("=AAA =");
	expect(renderMarkup("= AAA=", OPTIONS, "inline")).toBe("= AAA=");
	expect(renderMarkup("= AAA =", OPTIONS, "inline")).toBe("= AAA =");
	expect(renderMarkup("==AAA ==", OPTIONS, "inline")).toBe("==AAA ==");
	expect(renderMarkup("== AAA==", OPTIONS, "inline")).toBe("== AAA==");
	expect(renderMarkup("== AAA ==", OPTIONS, "inline")).toBe("== AAA ==");
});

test("INLINE_RULE nesting", () => {
	expect(renderMarkup("BEFORE ***BEFORE __ITALIC__ AFTER*** AFTER", OPTIONS, "inline")).toMatchObject([
		"BEFORE ",
		{
			$$typeof,
			type: "strong",
			props: {
				children: [
					"BEFORE ",
					{
						$$typeof,
						type: "em",
						props: { children: "ITALIC" },
					},
					" AFTER",
				],
			},
		},
		" AFTER",
	]);
});
