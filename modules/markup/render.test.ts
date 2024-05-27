import { describe, expect, test } from "bun:test";
import { isValidElement } from "react";
import { renderToString } from "react-dom/server";
import { renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.element");

const fencedElement = {
	type: "pre",
	props: {
		children: { type: "code", props: { children: "LINE1\nLINE2" } },
	},
};
const quoteElement = {
	type: "blockquote",
	props: { children: { type: "p", props: { children: "QUOTE" } } },
};
const quoteElements = {
	type: "blockquote",
	props: {
		children: [
			{ type: "p", props: { children: "QUOTE1" } },
			{ type: "p", props: { children: "QUOTE2" } },
		],
	},
};
const unorderedItemElement = {
	type: "ul",
	props: {
		children: [{ type: "li", props: { children: "ITEM" } }],
	},
};
const unorderedItemsElements = {
	type: "ul",
	props: {
		children: [
			{ type: "li", props: { children: "ITEM1" } },
			{ type: "li", props: { children: "ITEM2" } },
		],
	},
};
const nestedUnorderedItemElements = {
	type: "ul",
	props: {
		children: [{ type: "li", props: { children: ["ITEM", { ...unorderedItemsElements }] } }],
	},
};
const orderedItemElement = {
	type: "ol",
	props: {
		children: [{ type: "li", props: { value: 1, children: "ITEM" } }],
	},
};
const orderedItemElements = {
	type: "ol",
	props: {
		children: [
			{ type: "li", props: { value: 1111, children: "ITEM1" } },
			{ type: "li", props: { value: 2222, children: "ITEM2" } },
			{ type: "li", props: { value: 3333, children: "ITEM3" } },
		],
	},
};
const nestedOrderedItemElements = {
	type: "ol",
	props: {
		children: [
			{ type: "li", props: { value: 1, children: ["PARENT1", { ...orderedItemElements }] } },
			{ type: "li", props: { value: 2, children: "PARENT2" } },
			{ type: "li", props: { value: 3, children: "PARENT3" } },
		],
	},
};
const paragraphElement = { type: "p", props: { children: "PARAGRAPH" } };
const linkWithStrongElement = {
	type: "a",
	props: { href: "http://google.com/", children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
};
const linkWithEmElement = {
	type: "a",
	props: { href: "http://google.com/", children: ["BEFORE ", { type: "em", props: { children: "EM" } }, " AFTER"] },
};
const inlineMarkup = "*STRONG* and _EM_ and ++INS++ and ~~DEL~~ and `CODE` and http://google.com and [Google](http://google.com)";
const inlineElements = [
	{ type: "strong", key: "0", props: { children: "STRONG" } },
	" and ",
	{ type: "em", key: "13", props: { children: "EM" } },
	" and ",
	{ type: "ins", key: "22", props: { children: "INS" } },
	" and ",
	{ type: "del", key: "34", props: { children: "DEL" } },
	" and ",
	{ type: "code", key: "46", props: { children: "CODE" } },
	" and ",
	{ type: "a", key: "57", props: { children: "google.com", href: "http://google.com/" } },
	" and ",
	{ type: "a", key: "79", props: { children: "Google", href: "http://google.com/" } },
];
const wrappedInlineMarkup =
	"BEFORE *STRONG* and _EM_ and ++INS++ and ~~DEL~~ and `CODE` and http://google.com and [Google](http://google.com) AFTER";
const wrappedInlineElements = [
	"BEFORE ",
	{ type: "strong", key: "7", props: { children: "STRONG" } },
	" and ",
	{ type: "em", key: "20", props: { children: "EM" } },
	" and ",
	{ type: "ins", key: "29", props: { children: "INS" } },
	" and ",
	{ type: "del", key: "41", props: { children: "DEL" } },
	" and ",
	{ type: "code", key: "53", props: { children: "CODE" } },
	" and ",
	{ type: "a", key: "64", props: { children: "google.com", href: "http://google.com/" } },
	" and ",
	{ type: "a", key: "86", props: { children: "Google", href: "http://google.com/" } },
	" AFTER",
];

describe("renderMarkup(): Inline rules", () => {
	test("LINK", () => {
		const titledElement = { type: "a", props: { href: "http://google.com/", children: "Google" } };
		expect(renderMarkup("[Google](http://google.com)", { context: "inline" })).toMatchObject(titledElement);
		const untitledElement = { type: "a", props: { href: "http://google.com/", children: "google.com" } };
		expect(renderMarkup("[](http://google.com)", { context: "inline" })).toMatchObject(untitledElement);
		expect(renderMarkup("[\t ](http://google.com)", { context: "inline" })).toMatchObject(untitledElement);

		// Whitespace is stripped from start/end of both title and href.
		expect(renderMarkup("[\tGoogle\t](\thttp://google.com\t)", { context: "inline" })).toMatchObject(titledElement);

		// Links use the `rel` from the passed in context.
		const ugcTitledElement = { type: "a", props: { href: "http://google.com/", children: "Google", rel: "nofollow ugc" } };
		expect(renderMarkup("[Google](http://google.com)", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcTitledElement);
		const ugcUntitledElement = { type: "a", props: { href: "http://google.com/", children: "google.com", rel: "nofollow ugc" } };
		expect(renderMarkup("[](http://google.com)", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcUntitledElement);

		// Relative links use the `url` from the passed in context.
		const relativeElement = { type: "a", props: { href: "https://x.com/a/b/c", children: "XXX" } };
		expect(renderMarkup("[XXX](a/b/c)", { context: "inline", base: "https://x.com" })).toMatchObject(relativeElement);

		// Links can contain other inlines.
		expect(renderMarkup("[BEFORE *STRONG* AFTER](http://google.com)", { context: "inline" })).toMatchObject(linkWithStrongElement);
		expect(renderMarkup("[BEFORE _EM_ AFTER](http://google.com)", { context: "inline" })).toMatchObject(linkWithEmElement);

		// Links using schemes not in the whitelist are not linked.
		expect(renderMarkup("[NOPE](mailto:dave@shax.com)", { context: "inline" })).toBe("[NOPE](mailto:dave@shax.com)");

		// Links using schemes in whitelist are linked.
		expect(renderMarkup("[YEP](mailto:dave@shax.com)", { context: "inline", schemes: ["mailto:"] })).toMatchObject({
			type: "a",
			props: { href: "mailto:dave@shax.com", children: "YEP" },
		});
	});
	test("URL", () => {
		const titledElement = { type: "a", props: { href: "http://google.com/", children: "Google" } };
		expect(renderMarkup("http://google.com (Google)", { context: "inline" })).toMatchObject(titledElement);
		const untitledElement = { type: "a", props: { href: "http://google.com/", children: "google.com" } };
		expect(renderMarkup("http://google.com", { context: "inline" })).toMatchObject(untitledElement);
		expect(renderMarkup("http://google.com ()", { context: "inline" })).toMatchObject(untitledElement);
		expect(renderMarkup("http://google.com (\t )", { context: "inline" })).toMatchObject(untitledElement);

		// Links use the `rel` from the passed in context.
		const ugcTitledElement = { type: "a", props: { href: "http://google.com/", children: "Google", rel: "nofollow ugc" } };
		expect(renderMarkup("http://google.com (Google)", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcTitledElement);
		const ugcUntitledElement = { type: "a", props: { href: "http://google.com/", children: "google.com", rel: "nofollow ugc" } };
		expect(renderMarkup("http://google.com", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcUntitledElement);
		expect(renderMarkup("http://google.com ()", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcUntitledElement);

		// Links can contain other inlines.
		expect(renderMarkup("http://google.com (BEFORE *STRONG* AFTER)", { context: "inline" })).toMatchObject(linkWithStrongElement);
		expect(renderMarkup("http://google.com (BEFORE _EM_ AFTER)", { context: "inline" })).toMatchObject(linkWithEmElement);

		// Explicit links don't turn their children into autolinks.
		expect(renderMarkup("[http://google.com](http://google.com)", { context: "inline" })).toMatchObject({
			type: "a",
			props: { href: "http://google.com/", children: "http://google.com" },
		});

		// Autolinks cannot contain other autolinked URLs.
		expect(renderMarkup("http://google.com (http://google.com)", { context: "inline" })).toMatchObject({
			type: "a",
			props: { href: "http://google.com/", children: "http://google.com" },
		});

		// Links using schemes not in the whitelist are not linked.
		expect(renderMarkup("mailto:dave@shax.com", { context: "inline" })).toBe("mailto:dave@shax.com");

		// Links using schemes in whitelist are linked.
		expect(renderMarkup("ftp://localhost/a/b", { context: "inline", schemes: ["ftp:"] })).toMatchObject({
			type: "a",
			props: { href: "ftp://localhost/a/b", children: "localhost/a/b" },
		});
	});
	test("CODE", () => {
		expect(renderMarkup("`A`", { context: "inline" })).toMatchObject({ type: "code", props: { children: "A" } });
		expect(renderMarkup("`AAA`", { context: "inline" })).toMatchObject({ type: "code", props: { children: "AAA" } });
		expect(renderMarkup("``A``", { context: "inline" })).toMatchObject({ type: "code", props: { children: "A" } });
		expect(renderMarkup("``AAA``", { context: "inline" })).toMatchObject({ type: "code", props: { children: "AAA" } });
		expect(renderMarkup("``````AAA``````", { context: "inline" })).toMatchObject({ type: "code", props: { children: "AAA" } });
		expect(renderMarkup("BEFORE `AAA`", { context: "inline" })).toMatchObject([
			"BEFORE ",
			{ type: "code", props: { children: "AAA" } },
		] as Record<any, any>);
		expect(renderMarkup("`AAA` AFTER", { context: "inline" })).toMatchObject([
			{ type: "code", props: { children: "AAA" } },
			" AFTER",
		] as Record<any, any>);

		// Matching is non-greedy.
		expect(renderMarkup("`AAA` `AAA`", { context: "inline" })).toMatchObject([
			{ type: "code", props: { children: "AAA" } },
			" ",
			{ type: "code", props: { children: "AAA" } },
		] as Record<any, any>);

		// Code cannot contain other inline elements.
		expect(renderMarkup("`WORD *STRONG* WORD`", { context: "inline" })).toMatchObject({
			type: "code",
			props: { children: "WORD *STRONG* WORD" },
		});
		expect(renderMarkup("`WORD _EM_ WORD`", { context: "inline" })).toMatchObject({ type: "code", props: { children: "WORD _EM_ WORD" } });
		expect(renderMarkup("`*STRONG*`", { context: "inline" })).toMatchObject({ type: "code", props: { children: "*STRONG*" } });

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT`CODE`", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "code", props: { children: "CODE" } },
		] as Record<any, any>);
		expect(renderMarkup("`CODE`TEXT", { context: "inline" })).toMatchObject([
			{ type: "code", props: { children: "CODE" } },
			"TEXT",
		] as Record<any, any>);
		expect(renderMarkup("TEXT`CODE`TEXT", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "code", props: { children: "CODE" } },
			"TEXT",
		] as Record<any, any>);
	});
	test("STRONG", () => {
		expect(renderMarkup("*A*", { context: "inline" })).toMatchObject({ type: "strong", props: { children: "A" } });
		expect(renderMarkup("**A**", { context: "inline" })).toMatchObject({ type: "strong", props: { children: "A" } });
		expect(renderMarkup("******A******", { context: "inline" })).toMatchObject({ type: "strong", props: { children: "A" } });
		expect(renderMarkup("*AAA BBB*", { context: "inline" })).toMatchObject({ type: "strong", props: { children: "AAA BBB" } });
		expect(renderMarkup("**AAA BBB**", { context: "inline" })).toMatchObject({ type: "strong", props: { children: "AAA BBB" } });
		expect(renderMarkup("******AAA BBB******", { context: "inline" })).toMatchObject({ type: "strong", props: { children: "AAA BBB" } });
		expect(renderMarkup("BEFORE *AAA*", { context: "inline" })).toMatchObject([
			"BEFORE ",
			{ type: "strong", props: { children: "AAA" } },
		] as Record<any, any>);
		expect(renderMarkup("*AAA* AFTER", { context: "inline" })).toMatchObject([
			{ type: "strong", props: { children: "AAA" } },
			" AFTER",
		] as Record<any, any>);

		// Matching is non-greedy.
		expect(renderMarkup("*AAA* *AAA*", { context: "inline" })).toMatchObject([
			{ type: "strong", props: { children: "AAA" } },
			" ",
			{ type: "strong", props: { children: "AAA" } },
		] as Record<any, any>);

		// Can contain other inline elements.
		expect(renderMarkup("*BEFORE _EM_ AFTER*", { context: "inline" })).toMatchObject({
			type: "strong",
			props: { children: ["BEFORE ", { type: "em", props: { children: "EM" } }, " AFTER"] },
		});
		expect(renderMarkup("*_EM_*", { context: "inline" })).toMatchObject({
			type: "strong",
			props: { children: { type: "em", props: { children: "EM" } } },
		});

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT*STRONG*", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "strong", props: { children: "STRONG" } },
		] as Record<any, any>);
		expect(renderMarkup("*STRONG*TEXT", { context: "inline" })).toMatchObject([
			{ type: "strong", props: { children: "STRONG" } },
			"TEXT",
		] as Record<any, any>);
		expect(renderMarkup("TEXT*STRONG*TEXT", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "strong", props: { children: "STRONG" } },
			"TEXT",
		] as Record<any, any>);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("*AAA *", { context: "inline" })).toBe("*AAA *");
		expect(renderMarkup("* AAA*", { context: "inline" })).toBe("* AAA*");
		expect(renderMarkup("* AAA *", { context: "inline" })).toBe("* AAA *");
		expect(renderMarkup("**AAA **", { context: "inline" })).toBe("**AAA **");
		expect(renderMarkup("** AAA**", { context: "inline" })).toBe("** AAA**");
		expect(renderMarkup("** AAA **", { context: "inline" })).toBe("** AAA **");
	});
	test("EM", () => {
		expect(renderMarkup("_A_", { context: "inline" })).toMatchObject({ type: "em", props: { children: "A" } });
		expect(renderMarkup("__A__", { context: "inline" })).toMatchObject({ type: "em", props: { children: "A" } });
		expect(renderMarkup("______A______", { context: "inline" })).toMatchObject({ type: "em", props: { children: "A" } });
		expect(renderMarkup("_AAA BBB_", { context: "inline" })).toMatchObject({ type: "em", props: { children: "AAA BBB" } });
		expect(renderMarkup("__AAA BBB__", { context: "inline" })).toMatchObject({ type: "em", props: { children: "AAA BBB" } });
		expect(renderMarkup("______AAA BBB______", { context: "inline" })).toMatchObject({ type: "em", props: { children: "AAA BBB" } });
		expect(renderMarkup("BEFORE _AAA_", { context: "inline" })).toMatchObject([
			"BEFORE ",
			{ type: "em", props: { children: "AAA" } },
		] as Record<any, any>);
		expect(renderMarkup("_AAA_ AFTER", { context: "inline" })).toMatchObject([
			{ type: "em", props: { children: "AAA" } },
			" AFTER",
		] as Record<any, any>);

		// Matching is non-greedy.
		expect(renderMarkup("_AAA_ _AAA_", { context: "inline" })).toMatchObject([
			{ type: "em", props: { children: "AAA" } },
			" ",
			{ type: "em", props: { children: "AAA" } },
		] as Record<any, any>);

		// Can contain other inline elements.
		expect(renderMarkup("_BEFORE *STRONG* AFTER_", { context: "inline" })).toMatchObject({
			type: "em",
			props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
		});
		expect(renderMarkup("_*STRONG*_", { context: "inline" })).toMatchObject({
			type: "em",
			props: { children: { type: "strong", props: { children: "STRONG" } } },
		});

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT_EM_", { context: "inline" })).toMatchObject(["TEXT", { type: "em", props: { children: "EM" } }] as Record<
			any,
			any
		>);
		expect(renderMarkup("_EM_TEXT", { context: "inline" })).toMatchObject([{ type: "em", props: { children: "EM" } }, "TEXT"] as Record<
			any,
			any
		>);
		expect(renderMarkup("TEXT_EM_TEXT", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "em", props: { children: "EM" } },
			"TEXT",
		] as Record<any, any>);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("_AAA _", { context: "inline" })).toBe("_AAA _");
		expect(renderMarkup("_ AAA_", { context: "inline" })).toBe("_ AAA_");
		expect(renderMarkup("_ AAA _", { context: "inline" })).toBe("_ AAA _");
		expect(renderMarkup("__AAA __", { context: "inline" })).toBe("__AAA __");
		expect(renderMarkup("__ AAA__", { context: "inline" })).toBe("__ AAA__");
		expect(renderMarkup("__ AAA __", { context: "inline" })).toBe("__ AAA __");
	});
	test("INS", () => {
		expect(renderMarkup("+A+", { context: "inline" })).toMatchObject({ type: "ins", props: { children: "A" } });
		expect(renderMarkup("++A++", { context: "inline" })).toMatchObject({ type: "ins", props: { children: "A" } });
		expect(renderMarkup("++++++A++++++", { context: "inline" })).toMatchObject({ type: "ins", props: { children: "A" } });
		expect(renderMarkup("+AAA BBB+", { context: "inline" })).toMatchObject({ type: "ins", props: { children: "AAA BBB" } });
		expect(renderMarkup("++AAA BBB++", { context: "inline" })).toMatchObject({ type: "ins", props: { children: "AAA BBB" } });
		expect(renderMarkup("++++++AAA BBB++++++", { context: "inline" })).toMatchObject({ type: "ins", props: { children: "AAA BBB" } });
		expect(renderMarkup("BEFORE ++AAA++", { context: "inline" })).toMatchObject([
			"BEFORE ",
			{ type: "ins", props: { children: "AAA" } },
		] as Record<any, any>);
		expect(renderMarkup("++AAA++ AFTER", { context: "inline" })).toMatchObject([
			{ type: "ins", props: { children: "AAA" } },
			" AFTER",
		] as Record<any, any>);

		// Matching is non-greedy.
		expect(renderMarkup("++AAA++ ++AAA++", { context: "inline" })).toMatchObject([
			{ type: "ins", props: { children: "AAA" } },
			" ",
			{ type: "ins", props: { children: "AAA" } },
		] as Record<any, any>);

		// Can contain other inline elements.
		expect(renderMarkup("++BEFORE *STRONG* AFTER++", { context: "inline" })).toMatchObject({
			type: "ins",
			props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
		});
		expect(renderMarkup("++*STRONG*++", { context: "inline" })).toMatchObject({
			type: "ins",
			props: { children: { type: "strong", props: { children: "STRONG" } } },
		});

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT++INS++", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "ins", props: { children: "INS" } },
		] as Record<any, any>);
		expect(renderMarkup("++INS++TEXT", { context: "inline" })).toMatchObject([
			{ type: "ins", props: { children: "INS" } },
			"TEXT",
		] as Record<any, any>);
		expect(renderMarkup("TEXT++INS++TEXT", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "ins", props: { children: "INS" } },
			"TEXT",
		] as Record<any, any>);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("++AAA ++", { context: "inline" })).toBe("++AAA ++");
		expect(renderMarkup("++ AAA++", { context: "inline" })).toBe("++ AAA++");
		expect(renderMarkup("++ AAA ++", { context: "inline" })).toBe("++ AAA ++");
	});
	test("DEL (with tilde)", () => {
		expect(renderMarkup("~A~", { context: "inline" })).toMatchObject({ type: "del", props: { children: "A" } });
		expect(renderMarkup("~~A~~", { context: "inline" })).toMatchObject({ type: "del", props: { children: "A" } });
		expect(renderMarkup("~~~~~~A~~~~~~", { context: "inline" })).toMatchObject({ type: "del", props: { children: "A" } });
		expect(renderMarkup("~AAA BBB~", { context: "inline" })).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
		expect(renderMarkup("~~AAA BBB~~", { context: "inline" })).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
		expect(renderMarkup("~~~~~~AAA BBB~~~~~~", { context: "inline" })).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
		expect(renderMarkup("BEFORE ~~AAA~~", { context: "inline" })).toMatchObject([
			"BEFORE ",
			{ type: "del", props: { children: "AAA" } },
		] as Record<any, any>);
		expect(renderMarkup("~~AAA~~ AFTER", { context: "inline" })).toMatchObject([
			{ type: "del", props: { children: "AAA" } },
			" AFTER",
		] as Record<any, any>);

		// Matching is non~~greedy.
		expect(renderMarkup("~~AAA~~ ~~AAA~~", { context: "inline" })).toMatchObject([
			{ type: "del", props: { children: "AAA" } },
			" ",
			{ type: "del", props: { children: "AAA" } },
		] as Record<any, any>);

		// Can contain other inline elements.
		expect(renderMarkup("~~BEFORE *STRONG* AFTER~~", { context: "inline" })).toMatchObject({
			type: "del",
			props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
		});
		expect(renderMarkup("~~*STRONG*~~", { context: "inline" })).toMatchObject({
			type: "del",
			props: { children: { type: "strong", props: { children: "STRONG" } } },
		});

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT~~DEL~~", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "del", props: { children: "DEL" } },
		] as Record<any, any>);
		expect(renderMarkup("~~DEL~~TEXT", { context: "inline" })).toMatchObject([
			{ type: "del", props: { children: "DEL" } },
			"TEXT",
		] as Record<any, any>);
		expect(renderMarkup("TEXT~~DEL~~TEXT", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "del", props: { children: "DEL" } },
			"TEXT",
		] as Record<any, any>);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("~AAA ~", { context: "inline" })).toBe("~AAA ~");
		expect(renderMarkup("~ AAA~", { context: "inline" })).toBe("~ AAA~");
		expect(renderMarkup("~ AAA ~", { context: "inline" })).toBe("~ AAA ~");
		expect(renderMarkup("~~AAA ~~", { context: "inline" })).toBe("~~AAA ~~");
		expect(renderMarkup("~~ AAA~~", { context: "inline" })).toBe("~~ AAA~~");
		expect(renderMarkup("~~ AAA ~~", { context: "inline" })).toBe("~~ AAA ~~");
	});
	test("DEL (with hyphen)", () => {
		expect(renderMarkup("-A-", { context: "inline" })).toMatchObject({ type: "del", props: { children: "A" } });
		expect(renderMarkup("--A--", { context: "inline" })).toMatchObject({ type: "del", props: { children: "A" } });
		expect(renderMarkup("------A------", { context: "inline" })).toMatchObject({ type: "del", props: { children: "A" } });
		expect(renderMarkup("-AAA BBB-", { context: "inline" })).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
		expect(renderMarkup("--AAA BBB--", { context: "inline" })).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
		expect(renderMarkup("------AAA BBB------", { context: "inline" })).toMatchObject({ type: "del", props: { children: "AAA BBB" } });
		expect(renderMarkup("BEFORE --AAA--", { context: "inline" })).toMatchObject([
			"BEFORE ",
			{ type: "del", props: { children: "AAA" } },
		] as Record<any, any>);
		expect(renderMarkup("--AAA-- AFTER", { context: "inline" })).toMatchObject([
			{ type: "del", props: { children: "AAA" } },
			" AFTER",
		] as Record<any, any>);

		// Matching is non--greedy.
		expect(renderMarkup("--AAA-- --AAA--", { context: "inline" })).toMatchObject([
			{ type: "del", props: { children: "AAA" } },
			" ",
			{ type: "del", props: { children: "AAA" } },
		] as Record<any, any>);

		// Can contain other inline elements.
		expect(renderMarkup("--BEFORE *STRONG* AFTER--", { context: "inline" })).toMatchObject({
			type: "del",
			props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
		});
		expect(renderMarkup("--*STRONG*--", { context: "inline" })).toMatchObject({
			type: "del",
			props: { children: { type: "strong", props: { children: "STRONG" } } },
		});

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT--DEL--", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "del", props: { children: "DEL" } },
		] as Record<any, any>);
		expect(renderMarkup("--DEL--TEXT", { context: "inline" })).toMatchObject([
			{ type: "del", props: { children: "DEL" } },
			"TEXT",
		] as Record<any, any>);
		expect(renderMarkup("TEXT--DEL--TEXT", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "del", props: { children: "DEL" } },
			"TEXT",
		] as Record<any, any>);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("-AAA -", { context: "inline" })).toBe("-AAA -");
		expect(renderMarkup("- AAA-", { context: "inline" })).toBe("- AAA-");
		expect(renderMarkup("- AAA -", { context: "inline" })).toBe("- AAA -");
		expect(renderMarkup("--AAA --", { context: "inline" })).toBe("--AAA --");
		expect(renderMarkup("-- AAA--", { context: "inline" })).toBe("-- AAA--");
		expect(renderMarkup("-- AAA --", { context: "inline" })).toBe("-- AAA --");
	});
	test("MARK", () => {
		expect(renderMarkup("=A=", { context: "inline" })).toMatchObject({ type: "mark", props: { children: "A" } });
		expect(renderMarkup("==A==", { context: "inline" })).toMatchObject({ type: "mark", props: { children: "A" } });
		expect(renderMarkup("======A======", { context: "inline" })).toMatchObject({ type: "mark", props: { children: "A" } });
		expect(renderMarkup("=AAA BBB=", { context: "inline" })).toMatchObject({ type: "mark", props: { children: "AAA BBB" } });
		expect(renderMarkup("==AAA BBB==", { context: "inline" })).toMatchObject({ type: "mark", props: { children: "AAA BBB" } });
		expect(renderMarkup("======AAA BBB======", { context: "inline" })).toMatchObject({ type: "mark", props: { children: "AAA BBB" } });
		expect(renderMarkup("BEFORE ==AAA==", { context: "inline" })).toMatchObject([
			"BEFORE ",
			{ type: "mark", props: { children: "AAA" } },
		] as Record<any, any>);
		expect(renderMarkup("==AAA== AFTER", { context: "inline" })).toMatchObject([
			{ type: "mark", props: { children: "AAA" } },
			" AFTER",
		] as Record<any, any>);

		// Matching is non==greedy.
		expect(renderMarkup("==AAA== ==AAA==", { context: "inline" })).toMatchObject([
			{ type: "mark", props: { children: "AAA" } },
			" ",
			{ type: "mark", props: { children: "AAA" } },
		] as Record<any, any>);

		// Can contain other inline elements.
		expect(renderMarkup("==BEFORE *STRONG* AFTER==", { context: "inline" })).toMatchObject({
			type: "mark",
			props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
		});
		expect(renderMarkup("==*STRONG*==", { context: "inline" })).toMatchObject({
			type: "mark",
			props: { children: { type: "strong", props: { children: "STRONG" } } },
		});

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT==DEL==", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "mark", props: { children: "DEL" } },
		] as Record<any, any>);
		expect(renderMarkup("==DEL==TEXT", { context: "inline" })).toMatchObject([
			{ type: "mark", props: { children: "DEL" } },
			"TEXT",
		] as Record<any, any>);
		expect(renderMarkup("TEXT==DEL==TEXT", { context: "inline" })).toMatchObject([
			"TEXT",
			{ type: "mark", props: { children: "DEL" } },
			"TEXT",
		] as Record<any, any>);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("=AAA =", { context: "inline" })).toBe("=AAA =");
		expect(renderMarkup("= AAA=", { context: "inline" })).toBe("= AAA=");
		expect(renderMarkup("= AAA =", { context: "inline" })).toBe("= AAA =");
		expect(renderMarkup("==AAA ==", { context: "inline" })).toBe("==AAA ==");
		expect(renderMarkup("== AAA==", { context: "inline" })).toBe("== AAA==");
		expect(renderMarkup("== AAA ==", { context: "inline" })).toBe("== AAA ==");
	});
	test("Inline combinations", () => {
		expect(renderMarkup(inlineMarkup, { context: "inline" })).toMatchObject(inlineElements as Record<any, any>);
		expect(renderMarkup(wrappedInlineMarkup, { context: "inline" })).toMatchObject(wrappedInlineElements as Record<any, any>);
	});
});
describe("renderMarkup(): Block rules", () => {
	test("HEADING", () => {
		expect(renderMarkup("# HEADING")).toMatchObject({ type: "h1", props: { children: "HEADING" } });
		expect(renderMarkup("## HEADING")).toMatchObject({ type: "h2", props: { children: "HEADING" } });
		expect(renderMarkup("###### HEADING")).toMatchObject({ type: "h6", props: { children: "HEADING" } });
	});
	test("HR", () => {
		expect(renderMarkup("***")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("---")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("+++")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("•••")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("* * *")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("- - -")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("+ + +")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("• • •")).toMatchObject({ type: "hr", props: {} });
	});
	test("UL", () => {
		// Flat.
		expect(renderMarkup("- ITEM")).toMatchObject(unorderedItemElement);
		expect(renderMarkup("* ITEM")).toMatchObject(unorderedItemElement);
		expect(renderMarkup("+ ITEM")).toMatchObject(unorderedItemElement);
		expect(renderMarkup("• ITEM")).toMatchObject(unorderedItemElement);

		// Multiple.
		expect(renderMarkup("- ITEM1\n- ITEM2")).toMatchObject(unorderedItemsElements);
		expect(renderMarkup("* ITEM1\n* ITEM2")).toMatchObject(unorderedItemsElements);
		expect(renderMarkup("+ ITEM1\n+ ITEM2")).toMatchObject(unorderedItemsElements);
		expect(renderMarkup("• ITEM1\n• ITEM2")).toMatchObject(unorderedItemsElements);

		// Nested.
		expect(renderMarkup("- ITEM\n\t- ITEM1\n\t- ITEM2")).toMatchObject(nestedUnorderedItemElements);

		// List items can contain inlines.
		expect(renderMarkup(`- ${wrappedInlineMarkup}`)).toMatchObject({
			type: "ul",
			props: { children: [{ type: "li", props: { children: wrappedInlineElements } }] },
		});
	});
	test("OL", () => {
		// Single item.
		expect(renderMarkup("1. ITEM")).toMatchObject(orderedItemElement);
		expect(renderMarkup("1) ITEM")).toMatchObject(orderedItemElement);
		expect(renderMarkup("1: ITEM")).toMatchObject(orderedItemElement);
		expect(renderMarkup("2222. ITEM")).toMatchObject({
			type: "ol",
			props: { children: [{ type: "li", props: { value: 2222, children: "ITEM" } }] },
		});

		// Multiple items.
		expect(renderMarkup("1111. ITEM1\n2222. ITEM2\n3333. ITEM3")).toMatchObject(orderedItemElements);

		// Nested.
		expect(renderMarkup("1. PARENT1\n\t1111. ITEM1\n\t2222. ITEM2\n\t3333. ITEM3\n2. PARENT2\n3. PARENT3")).toMatchObject(
			nestedOrderedItemElements,
		);

		// List items can contain inlines.
		expect(renderMarkup(`369. ${wrappedInlineMarkup}`)).toMatchObject({
			type: "ol",
			props: { children: [{ type: "li", props: { value: 369, children: wrappedInlineElements } }] },
		});
	});
	test("BLOCKQUOTE", () => {
		// Single line.
		expect(renderMarkup(">QUOTE")).toMatchObject(quoteElement);
		expect(renderMarkup("> QUOTE")).toMatchObject(quoteElement);

		// Multiline.
		expect(renderMarkup(">QUOTE1\n>\n>QUOTE2")).toMatchObject(quoteElements);
		expect(renderMarkup("> QUOTE1\n>\n> QUOTE2")).toMatchObject(quoteElements);

		// Multiple quotes.
		expect(renderMarkup("> QUOTE\n\n> QUOTE")).toMatchObject([quoteElement, quoteElement]);
	});
	test("FENCED", () => {
		// Basic fenced block.
		expect(renderMarkup("```\nLINE1\nLINE2\n```")).toMatchObject(fencedElement);
		expect(renderMarkup("``````\nLINE1\nLINE2\n``````")).toMatchObject(fencedElement);
		expect(renderMarkup("~~~\nLINE1\nLINE2\n~~~")).toMatchObject(fencedElement);
		expect(renderMarkup("~~~~~~\nLINE1\nLINE2\n~~~~~~")).toMatchObject(fencedElement);
		expect(renderMarkup("```\nLINE1\nLINE2")).toMatchObject(fencedElement); // No close (runs to the end of the string).

		// With filename.
		expect(renderMarkup("```file.js\nLINE1\nLINE2\n```")).toMatchObject({
			type: "pre",
			props: { children: { type: "code", props: { title: "file.js", children: "LINE1\nLINE2" } } },
		});

		// Fenced cannot contain inlines or blocks.
		expect(renderMarkup("```\n- ITEM1\n*STRONG*\n```")).toMatchObject({
			type: "pre",
			props: {
				children: { type: "code", props: { children: "- ITEM1\n*STRONG*" } },
			},
		});
	});
	test("PARAGRAPH", () => {
		// Single line.
		expect(renderMarkup("PARAGRAPH")).toMatchObject(paragraphElement);
		expect(renderMarkup("PARAGRAPH\t   ")).toMatchObject(paragraphElement); // Trailing spaces.
		expect(renderMarkup("\t   PARAGRAPH")).toMatchObject(paragraphElement); // Leading spaces.

		// Multiline.
		expect(renderMarkup("PARAGRAPH1\n\nPARAGRAPH2")).toMatchObject([
			{ type: "p", props: { children: "PARAGRAPH1" } },
			{ type: "p", props: { children: "PARAGRAPH2" } },
		]);

		// Paragraphs can contain inlines.
		expect(renderMarkup(wrappedInlineMarkup)).toMatchObject({
			type: "p",
			props: { children: wrappedInlineElements },
		});

		// Blocks immediately after paragraphs break those paragraphs early.
		expect(renderMarkup("PARAGRAPH\n- ITEM")).toMatchObject([paragraphElement, { ...unorderedItemElement }]);
		expect(renderMarkup("PARAGRAPH\n1. ITEM")).toMatchObject([paragraphElement, { ...orderedItemElement }]);
		expect(renderMarkup("PARAGRAPH\n> QUOTE")).toMatchObject([paragraphElement, { ...quoteElement }]);
		expect(renderMarkup("PARAGRAPH\n```\nLINE1\nLINE2\n```")).toMatchObject([paragraphElement, { ...fencedElement }]);
	});
	test("Block combinations", () => {
		// Testing for things that are all 'block level'.
		const lines = [
			//
			"PARAGRAPH",
			"```\nLINE1\nLINE2\n```",
			"PARAGRAPH",
			"- ITEM\n\t- ITEM1\n\t- ITEM2",
			"PARAGRAPH",
			"1. PARENT1\n\t1111. ITEM1\n\t2222. ITEM2\n\t3333. ITEM3\n2. PARENT2\n3. PARENT3",
			"PARAGRAPH",
		];
		const elements = [
			//
			{ ...paragraphElement },
			{ ...fencedElement },
			{ ...paragraphElement },
			{ ...nestedUnorderedItemElements },
			{ ...paragraphElement },
			{ ...nestedOrderedItemElements },
			{ ...paragraphElement },
		];

		// Works with two newlines between.
		expect(renderMarkup(lines.join("\n\n"))).toMatchObject(elements);
	});
});
describe("renderMarkup(): React compatibility", () => {
	test("Creates valid React elements including $$typeof security key", () => {
		expect(isValidElement(renderMarkup("abc"))).toBe(true);
		expect(renderMarkup("abc")).toMatchObject({ type: "p", $$typeof });
		expect(isValidElement(renderMarkup("- ITEM"))).toBe(true);
		expect(renderMarkup("- ITEM")).toMatchObject({
			type: "ul",
			$$typeof,
			props: {
				children: [{ type: "li", $$typeof }],
			},
		});
		expect(isValidElement(renderMarkup("```\nCODE"))).toBe(true);
		expect(renderMarkup("```\nCODE")).toMatchObject({
			type: "pre",
			$$typeof,
			props: {
				children: { type: "code", $$typeof },
			},
		});
	});
	test("Generated elements can be rendered without error", () => {
		expect(() => renderToString(renderMarkup("PARAGRAPH"))).not.toThrow();
		expect(() => renderToString(renderMarkup("- ITEM"))).not.toThrow();
		expect(() => renderToString(renderMarkup("```\nCODE"))).not.toThrow();
	});
});
describe("renderMarkup(): Weird cases", () => {
	test("Empty string is `null`", () => {
		expect(renderMarkup("")).toBe(null);
	});
});
