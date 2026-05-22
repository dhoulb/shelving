import { expect, test } from "bun:test";
import { MarkupParser } from "../index.js";

const PARSER = new MarkupParser();

test("INLINE_RULE <strong>", () => {
	expect(PARSER.parse("*A*", "inline")).toMatchObject({ type: "strong", props: { children: "A" } });
	expect(PARSER.parse("**A**", "inline")).toMatchObject({ type: "strong", props: { children: "A" } });
	expect(PARSER.parse("******A******", "inline")).toMatchObject({ type: "strong", props: { children: "A" } });
	expect(PARSER.parse("*AAA BBB*", "inline")).toMatchObject({ type: "strong", props: { children: "AAA BBB" } });
	expect(PARSER.parse("**AAA BBB**", "inline")).toMatchObject({ type: "strong", props: { children: "AAA BBB" } });
	expect(PARSER.parse("******AAA BBB******", "inline")).toMatchObject({
		type: "strong",
		props: { children: "AAA BBB" },
	});
	expect(PARSER.parse("BEFORE *AAA*", "inline")).toMatchObject(["BEFORE ", { type: "strong", props: { children: "AAA" } }]);
	expect(PARSER.parse("*AAA* AFTER", "inline")).toMatchObject([{ type: "strong", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non-greedy.
	expect(PARSER.parse("*AAA* *AAA*", "inline")).toMatchObject([
		{ type: "strong", props: { children: "AAA" } },
		" ",
		{ type: "strong", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(PARSER.parse("*BEFORE _EM_ AFTER*", "inline")).toMatchObject({
		type: "strong",
		props: { children: ["BEFORE ", { type: "em", props: { children: "EM" } }, " AFTER"] },
	});
	expect(PARSER.parse("*_EM_*", "inline")).toMatchObject({
		type: "strong",
		props: { children: { type: "em", props: { children: "EM" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	// expect(PARSER.parse("TEXT*STRONG*", "inline")).toMatchObject([
	// 	"TEXT",
	// 	{  type: "strong", props: { children: "STRONG" } },
	// ]);
	// expect(PARSER.parse("*STRONG*TEXT", "inline")).toMatchObject([
	// 	{  type: "strong", props: { children: "STRONG" } },
	// 	"TEXT",
	// ]);
	// expect(PARSER.parse("TEXT*STRONG*TEXT", "inline")).toMatchObject([
	// 	"TEXT",
	// 	{  type: "strong", props: { children: "STRONG" } },
	// 	"TEXT",
	// ]);

	// Don't match infra-word punctuation.
	expect(PARSER.parse("TEXT*STRONG*TEXT", "inline")).toBe("TEXT*STRONG*TEXT");

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(PARSER.parse("*AAA *", "inline")).toBe("*AAA *");
	expect(PARSER.parse("* AAA*", "inline")).toBe("* AAA*");
	expect(PARSER.parse("* AAA *", "inline")).toBe("* AAA *");
	expect(PARSER.parse("**AAA **", "inline")).toBe("**AAA **");
	expect(PARSER.parse("** AAA**", "inline")).toBe("** AAA**");
	expect(PARSER.parse("** AAA **", "inline")).toBe("** AAA **");
});

test("INLINE_RULE <em>", () => {
	expect(PARSER.parse("_A_", "inline")).toMatchObject({ type: "em", props: { children: "A" } });
	expect(PARSER.parse("__A__", "inline")).toMatchObject({ type: "em", props: { children: "A" } });
	expect(PARSER.parse("______A______", "inline")).toMatchObject({ type: "em", props: { children: "A" } });
	expect(PARSER.parse("_AAA BBB_", "inline")).toMatchObject({ type: "em", props: { children: "AAA BBB" } });
	expect(PARSER.parse("__AAA BBB__", "inline")).toMatchObject({ type: "em", props: { children: "AAA BBB" } });
	expect(PARSER.parse("______AAA BBB______", "inline")).toMatchObject({ type: "em", props: { children: "AAA BBB" } });
	expect(PARSER.parse("BEFORE _AAA_", "inline")).toMatchObject(["BEFORE ", { type: "em", props: { children: "AAA" } }]);
	expect(PARSER.parse("_AAA_ AFTER", "inline")).toMatchObject([{ type: "em", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non-greedy.
	expect(PARSER.parse("_AAA_ _AAA_", "inline")).toMatchObject([
		{ type: "em", props: { children: "AAA" } },
		" ",
		{ type: "em", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(PARSER.parse("_BEFORE *STRONG* AFTER_", "inline")).toMatchObject({
		type: "em",
		props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(PARSER.parse("_*STRONG*_", "inline")).toMatchObject({
		type: "em",
		props: { children: { type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	// expect(PARSER.parse("TEXT_EM_", "inline")).toMatchObject(["TEXT", {  type: "em", props: { children: "EM" } }]);
	// expect(PARSER.parse("_EM_TEXT", "inline")).toMatchObject([{  type: "em", props: { children: "EM" } }, "TEXT"]);
	// expect(PARSER.parse("TEXT_EM_TEXT", "inline")).toMatchObject([
	// 	"TEXT",
	// 	{  type: "em", props: { children: "EM" } },
	// 	"TEXT",
	// ]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(PARSER.parse("_AAA _", "inline")).toBe("_AAA _");
	expect(PARSER.parse("_ AAA_", "inline")).toBe("_ AAA_");
	expect(PARSER.parse("_ AAA _", "inline")).toBe("_ AAA _");
	expect(PARSER.parse("__AAA __", "inline")).toBe("__AAA __");
	expect(PARSER.parse("__ AAA__", "inline")).toBe("__ AAA__");
	expect(PARSER.parse("__ AAA __", "inline")).toBe("__ AAA __");
});

test("INLINE_RULE <ins>", () => {
	expect(PARSER.parse("+A+", "inline")).toMatchObject({ type: "ins", props: { children: "A" } });
	expect(PARSER.parse("++A++", "inline")).toMatchObject({ type: "ins", props: { children: "A" } });
	expect(PARSER.parse("++++++A++++++", "inline")).toMatchObject({ type: "ins", props: { children: "A" } });
	expect(PARSER.parse("+AAA BBB+", "inline")).toMatchObject({ type: "ins", props: { children: "AAA BBB" } });
	expect(PARSER.parse("++AAA BBB++", "inline")).toMatchObject({ type: "ins", props: { children: "AAA BBB" } });
	expect(PARSER.parse("++++++AAA BBB++++++", "inline")).toMatchObject({ type: "ins", props: { children: "AAA BBB" } });
	expect(PARSER.parse("BEFORE ++AAA++", "inline")).toMatchObject(["BEFORE ", { type: "ins", props: { children: "AAA" } }]);
	expect(PARSER.parse("++AAA++ AFTER", "inline")).toMatchObject([{ type: "ins", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non-greedy.
	expect(PARSER.parse("++AAA++ ++AAA++", "inline")).toMatchObject([
		{ type: "ins", props: { children: "AAA" } },
		" ",
		{ type: "ins", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(PARSER.parse("++BEFORE *STRONG* AFTER++", "inline")).toMatchObject({
		type: "ins",
		props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(PARSER.parse("++*STRONG*++", "inline")).toMatchObject({
		type: "ins",
		props: { children: { type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	// expect(PARSER.parse("TEXT++INS++", "inline")).toMatchObject(["TEXT", {  type: "ins", props: { children: "INS" } }]);
	// expect(PARSER.parse("++INS++TEXT", "inline")).toMatchObject([{  type: "ins", props: { children: "INS" } }, "TEXT"]);
	// expect(PARSER.parse("TEXT++INS++TEXT", "inline")).toMatchObject([
	// 	"TEXT",
	// 	{  type: "ins", props: { children: "INS" } },
	// 	"TEXT",
	// ]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(PARSER.parse("++AAA ++", "inline")).toBe("++AAA ++");
	expect(PARSER.parse("++ AAA++", "inline")).toBe("++ AAA++");
	expect(PARSER.parse("++ AAA ++", "inline")).toBe("++ AAA ++");
});

test("INLINE_RULE <del> (with tilde)", () => {
	expect(PARSER.parse("~A~", "inline")).toMatchObject({ type: "del", props: { children: "A" } });
	expect(PARSER.parse("~~A~~", "inline")).toMatchObject({ type: "del", props: { children: "A" } });
	expect(PARSER.parse("~~~~~~A~~~~~~", "inline")).toMatchObject({ type: "del", props: { children: "A" } });
	expect(PARSER.parse("~AAA BBB~", "inline")).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
	expect(PARSER.parse("~~AAA BBB~~", "inline")).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
	expect(PARSER.parse("~~~~~~AAA BBB~~~~~~", "inline")).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
	expect(PARSER.parse("BEFORE ~~AAA~~", "inline")).toMatchObject(["BEFORE ", { type: "del", props: { children: "AAA" } }]);
	expect(PARSER.parse("~~AAA~~ AFTER", "inline")).toMatchObject([{ type: "del", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non~~greedy.
	expect(PARSER.parse("~~AAA~~ ~~AAA~~", "inline")).toMatchObject([
		{ type: "del", props: { children: "AAA" } },
		" ",
		{ type: "del", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(PARSER.parse("~~BEFORE *STRONG* AFTER~~", "inline")).toMatchObject({
		type: "del",
		props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(PARSER.parse("~~*STRONG*~~", "inline")).toMatchObject({
		type: "del",
		props: { children: { type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	// expect(PARSER.parse("TEXT~~DEL~~", "inline")).toMatchObject(["TEXT", {  type: "del", props: { children: "DEL" } }]);
	// expect(PARSER.parse("~~DEL~~TEXT", "inline")).toMatchObject([{  type: "del", props: { children: "DEL" } }, "TEXT"]);
	// expect(PARSER.parse("TEXT~~DEL~~TEXT", "inline")).toMatchObject([
	// 	"TEXT",
	// 	{  type: "del", props: { children: "DEL" } },
	// 	"TEXT",
	// ]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(PARSER.parse("~AAA ~", "inline")).toBe("~AAA ~");
	expect(PARSER.parse("~ AAA~", "inline")).toBe("~ AAA~");
	expect(PARSER.parse("~ AAA ~", "inline")).toBe("~ AAA ~");
	expect(PARSER.parse("~~AAA ~~", "inline")).toBe("~~AAA ~~");
	expect(PARSER.parse("~~ AAA~~", "inline")).toBe("~~ AAA~~");
	expect(PARSER.parse("~~ AAA ~~", "inline")).toBe("~~ AAA ~~");
});

test("INLINE_RULE <del> (with hyphen)", () => {
	expect(PARSER.parse("-A-", "inline")).toMatchObject({ type: "del", props: { children: "A" } });
	expect(PARSER.parse("--A--", "inline")).toMatchObject({ type: "del", props: { children: "A" } });
	expect(PARSER.parse("------A------", "inline")).toMatchObject({ type: "del", props: { children: "A" } });
	expect(PARSER.parse("-AAA BBB-", "inline")).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
	expect(PARSER.parse("--AAA BBB--", "inline")).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
	expect(PARSER.parse("------AAA BBB------", "inline")).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
	expect(PARSER.parse("BEFORE --AAA--", "inline")).toMatchObject(["BEFORE ", { type: "del", props: { children: "AAA" } }]);
	expect(PARSER.parse("--AAA-- AFTER", "inline")).toMatchObject([{ type: "del", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non--greedy.
	expect(PARSER.parse("--AAA-- --AAA--", "inline")).toMatchObject([
		{ type: "del", props: { children: "AAA" } },
		" ",
		{ type: "del", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(PARSER.parse("--BEFORE *STRONG* AFTER--", "inline")).toMatchObject({
		type: "del",
		props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(PARSER.parse("--*STRONG*--", "inline")).toMatchObject({
		type: "del",
		props: { children: { type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	// expect(PARSER.parse("TEXT--DEL--", "inline")).toMatchObject(["TEXT", {  type: "del", props: { children: "DEL" } }]);
	// expect(PARSER.parse("--DEL--TEXT", "inline")).toMatchObject([{  type: "del", props: { children: "DEL" } }, "TEXT"]);
	// expect(PARSER.parse("TEXT--DEL--TEXT", "inline")).toMatchObject([
	// 	"TEXT",
	// 	{  type: "del", props: { children: "DEL" } },
	// 	"TEXT",
	// ]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(PARSER.parse("-AAA -", "inline")).toBe("-AAA -");
	expect(PARSER.parse("- AAA-", "inline")).toBe("- AAA-");
	expect(PARSER.parse("- AAA -", "inline")).toBe("- AAA -");
	expect(PARSER.parse("--AAA --", "inline")).toBe("--AAA --");
	expect(PARSER.parse("-- AAA--", "inline")).toBe("-- AAA--");
	expect(PARSER.parse("-- AAA --", "inline")).toBe("-- AAA --");
});

test("INLINE_RULE <mark>", () => {
	expect(PARSER.parse("=A=", "inline")).toMatchObject({ type: "mark", props: { children: "A" } });
	expect(PARSER.parse("==A==", "inline")).toMatchObject({ type: "mark", props: { children: "A" } });
	expect(PARSER.parse("======A======", "inline")).toMatchObject({ type: "mark", props: { children: "A" } });
	expect(PARSER.parse("=AAA BBB=", "inline")).toMatchObject({ type: "mark", props: { children: "AAA BBB" } });
	expect(PARSER.parse("==AAA BBB==", "inline")).toMatchObject({ type: "mark", props: { children: "AAA BBB" } });
	expect(PARSER.parse("======AAA BBB======", "inline")).toMatchObject({
		type: "mark",
		props: { children: "AAA BBB" },
	});
	expect(PARSER.parse("BEFORE ==AAA==", "inline")).toMatchObject(["BEFORE ", { type: "mark", props: { children: "AAA" } }]);
	expect(PARSER.parse("==AAA== AFTER", "inline")).toMatchObject([{ type: "mark", props: { children: "AAA" } }, " AFTER"]);

	// Matching is non==greedy.
	expect(PARSER.parse("==AAA== ==AAA==", "inline")).toMatchObject([
		{ type: "mark", props: { children: "AAA" } },
		" ",
		{ type: "mark", props: { children: "AAA" } },
	]);

	// Can contain other inline elements.
	expect(PARSER.parse("==BEFORE *STRONG* AFTER==", "inline")).toMatchObject({
		type: "mark",
		props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
	});
	expect(PARSER.parse("==*STRONG*==", "inline")).toMatchObject({
		type: "mark",
		props: { children: { type: "strong", props: { children: "STRONG" } } },
	});

	// Match even if the opening and closing punctuation is in the middle of the word.
	// expect(PARSER.parse("TEXT==DEL==", "inline")).toMatchObject(["TEXT", {  type: "mark", props: { children: "DEL" } }]);
	// expect(PARSER.parse("==DEL==TEXT", "inline")).toMatchObject([{  type: "mark", props: { children: "DEL" } }, "TEXT"]);
	// expect(PARSER.parse("TEXT==DEL==TEXT", "inline")).toMatchObject([
	// 	"TEXT",
	// 	{  type: "mark", props: { children: "DEL" } },
	// 	"TEXT",
	// ]);

	// Only match if it doesn't contain whitespace at the start/end of the element.
	expect(PARSER.parse("=AAA =", "inline")).toBe("=AAA =");
	expect(PARSER.parse("= AAA=", "inline")).toBe("= AAA=");
	expect(PARSER.parse("= AAA =", "inline")).toBe("= AAA =");
	expect(PARSER.parse("==AAA ==", "inline")).toBe("==AAA ==");
	expect(PARSER.parse("== AAA==", "inline")).toBe("== AAA==");
	expect(PARSER.parse("== AAA ==", "inline")).toBe("== AAA ==");
});

test("INLINE_RULE around code spans", () => {
	// Inline emphasis must still form when its content starts or ends with a code span. Code
	// spans are a higher-priority tier that is masked before emphasis resolves, so a leading or
	// trailing code span must be treated as content — not mistaken for whitespace.

	// The exact markdown from the bug report (`**` strong starting with a code span).
	expect(PARSER.parse("**`<TreeApp>` is the entry point.**", "inline")).toMatchObject({
		type: "strong",
		props: {
			children: [{ type: "code", props: { children: "<TreeApp>" } }, " is the entry point."],
		},
	});

	// Strong wrapping only a code span.
	expect(PARSER.parse("**`CODE`**", "inline")).toMatchObject({
		type: "strong",
		props: { children: { type: "code", props: { children: "CODE" } } },
	});

	// Code span at the start.
	expect(PARSER.parse("*`CODE` AFTER*", "inline")).toMatchObject({
		type: "strong",
		props: { children: [{ type: "code", props: { children: "CODE" } }, " AFTER"] },
	});

	// Code span at the end.
	expect(PARSER.parse("**BEFORE `CODE`**", "inline")).toMatchObject({
		type: "strong",
		props: { children: ["BEFORE ", { type: "code", props: { children: "CODE" } }] },
	});

	// Code spans at both ends (with `_` emphasis).
	expect(PARSER.parse("__`AAA` and `BBB`__", "inline")).toMatchObject({
		type: "em",
		props: {
			children: [{ type: "code", props: { children: "AAA" } }, " and ", { type: "code", props: { children: "BBB" } }],
		},
	});
});

test("INLINE_RULE nesting", () => {
	expect(PARSER.parse("BEFORE ***BEFORE __ITALIC__ AFTER*** AFTER", "inline")).toMatchObject([
		"BEFORE ",
		{
			type: "strong",
			props: {
				children: [
					"BEFORE ",
					{
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
