import { isValidElement } from "react";
import { renderToString } from "react-dom/server";
import { renderMarkup, MarkupElement } from "../index.js";

const $$typeof = Symbol.for("react.element");

const fencedElement = {
	type: "pre",
	props: {
		children: { type: "code", props: { children: "LINE1\nLINE2" } },
	},
};
const namedFencedElement = {
	type: "pre",
	props: { children: { type: "code", props: { "data-file": "file.js", "children": "LINE1\nLINE2" } } },
};

const quoteElement = {
	type: "blockquote",
	props: { children: { type: "p", props: { children: "QUOTE" } } },
};
const quoteElements = {
	type: "blockquote",
	props: {
		children: [
			{ type: "p", key: 0, props: { children: "QUOTE1" } },
			{ type: "p", key: 1, props: { children: "QUOTE2" } },
		],
	},
};

const unorderedItemElement = {
	type: "ul",
	props: {
		children: [{ type: "li", key: 0, props: { children: "ITEM" } }],
	},
};
const unorderedItemsElements = {
	type: "ul",
	props: {
		children: [
			{ type: "li", key: 0, props: { children: "ITEM1" } },
			{ type: "li", key: 1, props: { children: "ITEM2" } },
		],
	},
};
const nestedUnorderedItemElements = {
	type: "ul",
	props: {
		children: [{ type: "li", key: 0, props: { children: ["ITEM", { ...unorderedItemsElements, key: 1 }] } }],
	},
};

const orderedItemElement = {
	type: "ol",
	props: {
		children: [{ type: "li", key: 0, props: { value: 1, children: "ITEM" } }],
	},
};
const orderedItemElements = {
	type: "ol",
	props: {
		children: [
			{ type: "li", key: 0, props: { value: 1111, children: "ITEM1" } },
			{ type: "li", key: 1, props: { value: 2222, children: "ITEM2" } },
			{ type: "li", key: 2, props: { value: 3333, children: "ITEM3" } },
		],
	},
};
const nestedOrderedItemElements = {
	type: "ol",
	props: {
		children: [
			{ type: "li", key: 0, props: { value: 1, children: ["PARENT1", { ...orderedItemElements, key: 1 }] } },
			{ type: "li", key: 1, props: { value: 2, children: "PARENT2" } },
			{ type: "li", key: 2, props: { value: 3, children: "PARENT3" } },
		],
	},
};

const paragraphMarkup = "PARAGRAPH";
const paragraphElement = { type: "p", props: { children: "PARAGRAPH" } };

const paragraphsMarkup = "PARAGRAPH1\n\nPARAGRAPH2";
const paragraphsElements = [
	{ type: "p", key: 0, props: { children: "PARAGRAPH1" } },
	{ type: "p", key: 1, props: { children: "PARAGRAPH2" } },
];

const linkWithStrongElement = {
	type: "a",
	props: { href: "http://google.com/", children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
};
const linkWithEmElement = {
	type: "a",
	props: { href: "http://google.com/", children: ["BEFORE ", { type: "em", props: { children: "EM" } }, " AFTER"] },
};

const inlineMarkup = "*STRONG* and _EM_ and +INS+ and ~DEL~ and `CODE` and http://google.com and [Google](http://google.com)";
const inlineElements = [
	{ type: "strong", key: 0, props: { children: "STRONG" } },
	" and ",
	{ type: "em", key: 2, props: { children: "EM" } },
	" and ",
	{ type: "ins", key: 4, props: { children: "INS" } },
	" and ",
	{ type: "del", key: 6, props: { children: "DEL" } },
	" and ",
	{ type: "code", key: 8, props: { children: "CODE" } },
	" and ",
	{ type: "a", key: 10, props: { children: "google.com", href: "http://google.com/" } },
	" and ",
	{ type: "a", key: 12, props: { children: "Google", href: "http://google.com/" } },
];

const wrappedInlineMarkup = "BEFORE *STRONG* and _EM_ and +INS+ and ~DEL~ and `CODE` and http://google.com and [Google](http://google.com) AFTER";
const wrappedInlineElements = [
	"BEFORE ",
	{ type: "strong", key: 1, props: { children: "STRONG" } },
	" and ",
	{ type: "em", key: 3, props: { children: "EM" } },
	" and ",
	{ type: "ins", key: 5, props: { children: "INS" } },
	" and ",
	{ type: "del", key: 7, props: { children: "DEL" } },
	" and ",
	{ type: "code", key: 9, props: { children: "CODE" } },
	" and ",
	{ type: "a", key: 11, props: { children: "google.com", href: "http://google.com/" } },
	" and ",
	{ type: "a", key: 13, props: { children: "Google", href: "http://google.com/" } },
	" AFTER",
];

describe("renderMarkup(): Inline rules", () => {
	test("LINK", () => {
		const titledElement = { type: "a", props: { href: "http://google.com/", children: "Google" } };
		expect(renderMarkup("[Google](http://google.com)", { context: "inline" })).toMatchObject(titledElement);
		const untitledElement = { type: "a", props: { href: "http://google.com/", children: "google.com" } };
		expect(renderMarkup("[](http://google.com)", { context: "inline" })).toMatchObject(untitledElement);
		expect(renderMarkup("[     ](http://google.com)", { context: "inline" })).toMatchObject(untitledElement);

		// Whitespace is stripped from start/end of both title and href.
		expect(renderMarkup("[    Google    ](    http://google.com    )", { context: "inline" })).toMatchObject(titledElement);

		// Links use the `rel` from the passed in context.
		const ugcTitledElement = { type: "a", props: { href: "http://google.com/", children: "Google", rel: "nofollow ugc" } };
		expect(renderMarkup("[Google](http://google.com)", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcTitledElement);
		const ugcUntitledElement = { type: "a", props: { href: "http://google.com/", children: "google.com", rel: "nofollow ugc" } };
		expect(renderMarkup("[](http://google.com)", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcUntitledElement);

		// Relative links use the `url` from the passed in context.
		const relativeElement = { type: "a", props: { href: "https://x.com/a/b/c", children: "XXX" } };
		expect(renderMarkup("[XXX](a/b/c)", { context: "inline", url: "https://x.com" })).toMatchObject(relativeElement);

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
		expect(renderMarkup("http://google.com [Google]", { context: "inline" })).toMatchObject(titledElement);
		const untitledElement = { type: "a", props: { href: "http://google.com/", children: "google.com" } };
		expect(renderMarkup("http://google.com", { context: "inline" })).toMatchObject(untitledElement);
		expect(renderMarkup("http://google.com ()", { context: "inline" })).toMatchObject(untitledElement);
		expect(renderMarkup("http://google.com []", { context: "inline" })).toMatchObject(untitledElement);
		expect(renderMarkup("http://google.com (     )", { context: "inline" })).toMatchObject(untitledElement);
		expect(renderMarkup("http://google.com [     ]", { context: "inline" })).toMatchObject(untitledElement);

		// Whitespace is stripped from title and href and between the title and href.
		expect(renderMarkup("http://google.com     (    Google    )", { context: "inline" })).toMatchObject(titledElement);

		// Links use the `rel` from the passed in context.
		const ugcTitledElement = { type: "a", props: { href: "http://google.com/", children: "Google", rel: "nofollow ugc" } };
		expect(renderMarkup("http://google.com (Google)", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcTitledElement);
		const ugcUntitledElement = { type: "a", props: { href: "http://google.com/", children: "google.com", rel: "nofollow ugc" } };
		expect(renderMarkup("http://google.com", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcUntitledElement);
		expect(renderMarkup("http://google.com ()", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcUntitledElement);
		expect(renderMarkup("http://google.com []", { context: "inline", rel: "nofollow ugc" })).toMatchObject(ugcUntitledElement);

		// Links can contain other inlines.
		expect(renderMarkup("http://google.com (BEFORE *STRONG* AFTER)", { context: "inline" })).toMatchObject(linkWithStrongElement);
		expect(renderMarkup("http://google.com [BEFORE *STRONG* AFTER]", { context: "inline" })).toMatchObject(linkWithStrongElement);
		expect(renderMarkup("http://google.com (BEFORE _EM_ AFTER)", { context: "inline" })).toMatchObject(linkWithEmElement);
		expect(renderMarkup("http://google.com [BEFORE _EM_ AFTER]", { context: "inline" })).toMatchObject(linkWithEmElement);

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
		expect(renderMarkup("mailto:dave@shax.com", { context: "inline", schemes: ["mailto:"] })).toMatchObject({
			type: "a",
			props: { href: "mailto:dave@shax.com", children: "dave@shax.com" },
		});
	});
	test("CODE", () => {
		expect(renderMarkup("`A`", { context: "inline" })).toMatchObject({ type: "code", props: { children: "A" } });
		expect(renderMarkup("`AAA`", { context: "inline" })).toMatchObject({ type: "code", props: { children: "AAA" } });
		expect(renderMarkup("``````AAA``````", { context: "inline" })).toMatchObject({
			type: "code",
			props: { children: "AAA" },
		});
		expect(renderMarkup("BEFORE `AAA`", { context: "inline" })).toMatchObject(["BEFORE ", { type: "code", props: { children: "AAA" } }]);
		expect(renderMarkup("`AAA` AFTER", { context: "inline" })).toMatchObject([{ type: "code", props: { children: "AAA" } }, " AFTER"]);

		// Matching is non-greedy.
		expect(renderMarkup("`AAA` `AAA`", { context: "inline" })).toMatchObject([
			{ type: "code", props: { children: "AAA" } },
			" ",
			{ type: "code", props: { children: "AAA" } },
		]);

		// Code can contain leading/trailing whitespace.
		expect(renderMarkup("`AAA   `", { context: "inline" })).toMatchObject({ type: "code", props: { children: "AAA   " } });
		expect(renderMarkup("`   AAA`", { context: "inline" })).toMatchObject({ type: "code", props: { children: "   AAA" } });
		expect(renderMarkup("`   AAA   `", { context: "inline" })).toMatchObject({ type: "code", props: { children: "   AAA   " } });

		// Code cannot contain other inline elements.
		expect(renderMarkup("`WORD *STRONG* WORD`", { context: "inline" })).toMatchObject({
			type: "code",
			props: { children: "WORD *STRONG* WORD" },
		});
		expect(renderMarkup("`WORD _EM_ WORD`", { context: "inline" })).toMatchObject({ type: "code", props: { children: "WORD _EM_ WORD" } });
		expect(renderMarkup("`*STRONG*`", { context: "inline" })).toMatchObject({ type: "code", props: { children: "*STRONG*" } });

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT`CODE`", { context: "inline" })).toMatchObject(["TEXT", { type: "code", props: { children: "CODE" } }]);
		expect(renderMarkup("`CODE`TEXT", { context: "inline" })).toMatchObject([{ type: "code", props: { children: "CODE" } }, "TEXT"]);
		expect(renderMarkup("TEXT`CODE`TEXT", { context: "inline" })).toMatchObject(["TEXT", { type: "code", props: { children: "CODE" } }, "TEXT"]);
	});
	test("STRONG", () => {
		expect(renderMarkup("*A*", { context: "inline" })).toMatchObject({ type: "strong", props: { children: "A" } });
		expect(renderMarkup("*AAA*", { context: "inline" })).toMatchObject({ type: "strong", props: { children: "AAA" } });
		expect(renderMarkup("******AAA******", { context: "inline" })).toMatchObject({
			type: "strong",
			props: { children: "AAA" },
		});
		expect(renderMarkup("BEFORE *AAA*", { context: "inline" })).toMatchObject(["BEFORE ", { type: "strong", props: { children: "AAA" } }]);
		expect(renderMarkup("*AAA* AFTER", { context: "inline" })).toMatchObject([{ type: "strong", props: { children: "AAA" } }, " AFTER"]);

		// Matching is non-greedy.
		expect(renderMarkup("*AAA* *AAA*", { context: "inline" })).toMatchObject([
			{ type: "strong", props: { children: "AAA" } },
			" ",
			{ type: "strong", props: { children: "AAA" } },
		]);

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
		expect(renderMarkup("TEXT*STRONG*", { context: "inline" })).toMatchObject(["TEXT", { type: "strong", props: { children: "STRONG" } }]);
		expect(renderMarkup("*STRONG*TEXT", { context: "inline" })).toMatchObject([{ type: "strong", props: { children: "STRONG" } }, "TEXT"]);
		expect(renderMarkup("TEXT*STRONG*TEXT", { context: "inline" })).toMatchObject(["TEXT", { type: "strong", props: { children: "STRONG" } }, "TEXT"]);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("*AAA *", { context: "inline" })).toEqual("*AAA *");
		expect(renderMarkup("* AAA*", { context: "inline" })).toEqual("* AAA*");
		expect(renderMarkup("* AAA *", { context: "inline" })).toEqual("* AAA *");
	});
	test("EM", () => {
		expect(renderMarkup("_A_", { context: "inline" })).toMatchObject({ type: "em", props: { children: "A" } });
		expect(renderMarkup("_AAA_", { context: "inline" })).toMatchObject({ type: "em", props: { children: "AAA" } });
		expect(renderMarkup("______AAA______", { context: "inline" })).toMatchObject({
			type: "em",
			props: { children: "AAA" },
		});
		expect(renderMarkup("BEFORE _AAA_", { context: "inline" })).toMatchObject(["BEFORE ", { type: "em", props: { children: "AAA" } }]);
		expect(renderMarkup("_AAA_ AFTER", { context: "inline" })).toMatchObject([{ type: "em", props: { children: "AAA" } }, " AFTER"]);

		// Matching is non-greedy.
		expect(renderMarkup("_AAA_ _AAA_", { context: "inline" })).toMatchObject([
			{ type: "em", props: { children: "AAA" } },
			" ",
			{ type: "em", props: { children: "AAA" } },
		]);

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
		expect(renderMarkup("TEXT_EM_", { context: "inline" })).toMatchObject(["TEXT", { type: "em", props: { children: "EM" } }]);
		expect(renderMarkup("_EM_TEXT", { context: "inline" })).toMatchObject([{ type: "em", props: { children: "EM" } }, "TEXT"]);
		expect(renderMarkup("TEXT_EM_TEXT", { context: "inline" })).toMatchObject(["TEXT", { type: "em", props: { children: "EM" } }, "TEXT"]);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("_AAA _", { context: "inline" })).toEqual("_AAA _");
		expect(renderMarkup("_ AAA_", { context: "inline" })).toEqual("_ AAA_");
		expect(renderMarkup("_ AAA _", { context: "inline" })).toEqual("_ AAA _");
	});
	test("INS", () => {
		expect(renderMarkup("+A+", { context: "inline" })).toMatchObject({ type: "ins", props: { children: "A" } });
		expect(renderMarkup("+AAA+", { context: "inline" })).toMatchObject({ type: "ins", props: { children: "AAA" } });
		expect(renderMarkup("++++++AAA++++++", { context: "inline" })).toMatchObject({
			type: "ins",
			props: { children: "AAA" },
		});
		expect(renderMarkup("BEFORE +AAA+", { context: "inline" })).toMatchObject(["BEFORE ", { type: "ins", props: { children: "AAA" } }]);
		expect(renderMarkup("+AAA+ AFTER", { context: "inline" })).toMatchObject([{ type: "ins", props: { children: "AAA" } }, " AFTER"]);

		// Matching is non-greedy.
		expect(renderMarkup("+AAA+ +AAA+", { context: "inline" })).toMatchObject([
			{ type: "ins", props: { children: "AAA" } },
			" ",
			{ type: "ins", props: { children: "AAA" } },
		]);

		// Can contain other inline elements.
		expect(renderMarkup("+BEFORE *STRONG* AFTER+", { context: "inline" })).toMatchObject({
			type: "ins",
			props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
		});
		expect(renderMarkup("+*STRONG*+", { context: "inline" })).toMatchObject({
			type: "ins",
			props: { children: { type: "strong", props: { children: "STRONG" } } },
		});

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT+INS+", { context: "inline" })).toMatchObject(["TEXT", { type: "ins", props: { children: "INS" } }]);
		expect(renderMarkup("+INS+TEXT", { context: "inline" })).toMatchObject([{ type: "ins", props: { children: "INS" } }, "TEXT"]);
		expect(renderMarkup("TEXT+INS+TEXT", { context: "inline" })).toMatchObject(["TEXT", { type: "ins", props: { children: "INS" } }, "TEXT"]);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("+AAA +", { context: "inline" })).toEqual("+AAA +");
		expect(renderMarkup("+ AAA+", { context: "inline" })).toEqual("+ AAA+");
		expect(renderMarkup("+ AAA +", { context: "inline" })).toEqual("+ AAA +");
	});
	test("DEL", () => {
		expect(renderMarkup("~A~", { context: "inline" })).toMatchObject({ type: "del", props: { children: "A" } });
		expect(renderMarkup("~AAA~", { context: "inline" })).toMatchObject({ type: "del", props: { children: "AAA" } });
		expect(renderMarkup("~~~~~~AAA~~~~~~", { context: "inline" })).toMatchObject({
			type: "del",
			props: { children: "AAA" },
		});
		expect(renderMarkup("BEFORE ~AAA~", { context: "inline" })).toMatchObject(["BEFORE ", { type: "del", props: { children: "AAA" } }]);
		expect(renderMarkup("~AAA~ AFTER", { context: "inline" })).toMatchObject([{ type: "del", props: { children: "AAA" } }, " AFTER"]);

		// Matching is non~greedy.
		expect(renderMarkup("~AAA~ ~AAA~", { context: "inline" })).toMatchObject([
			{ type: "del", props: { children: "AAA" } },
			" ",
			{ type: "del", props: { children: "AAA" } },
		]);

		// Can contain other inline elements.
		expect(renderMarkup("~BEFORE *STRONG* AFTER~", { context: "inline" })).toMatchObject({
			type: "del",
			props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] },
		});
		expect(renderMarkup("~*STRONG*~", { context: "inline" })).toMatchObject({
			type: "del",
			props: { children: { type: "strong", props: { children: "STRONG" } } },
		});

		// Match even if the opening and closing punctuation is in the middle of the word.
		expect(renderMarkup("TEXT~DEL~", { context: "inline" })).toMatchObject(["TEXT", { type: "del", props: { children: "DEL" } }]);
		expect(renderMarkup("~DEL~TEXT", { context: "inline" })).toMatchObject([{ type: "del", props: { children: "DEL" } }, "TEXT"]);
		expect(renderMarkup("TEXT~DEL~TEXT", { context: "inline" })).toMatchObject(["TEXT", { type: "del", props: { children: "DEL" } }, "TEXT"]);

		// Only match if it doesn't contain whitespace at the start/end of the element.
		expect(renderMarkup("~AAA ~", { context: "inline" })).toEqual("~AAA ~");
		expect(renderMarkup("~ AAA~", { context: "inline" })).toEqual("~ AAA~");
		expect(renderMarkup("~ AAA ~", { context: "inline" })).toEqual("~ AAA ~");
	});
	test("Inline combinations", () => {
		expect(renderMarkup(inlineMarkup, { context: "inline" })).toMatchObject(inlineElements);
		expect(renderMarkup(wrappedInlineMarkup, { context: "inline" })).toMatchObject(wrappedInlineElements);
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
		expect(renderMarkup("*      *      *")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("-      -      -")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("+      +      +")).toMatchObject({ type: "hr", props: {} });
		expect(renderMarkup("•      •      •")).toMatchObject({ type: "hr", props: {} });
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
		expect(renderMarkup("- ITEM\n  - ITEM1\n  - ITEM2")).toMatchObject(nestedUnorderedItemElements);

		// List items can contain inlines.
		expect(renderMarkup("- " + wrappedInlineMarkup)).toMatchObject({
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
		expect(renderMarkup("1. PARENT1\n  1111. ITEM1\n  2222. ITEM2\n  3333. ITEM3\n2. PARENT2\n3. PARENT3")).toMatchObject(nestedOrderedItemElements);

		// List items can contain inlines.
		expect(renderMarkup("369. " + wrappedInlineMarkup)).toMatchObject({
			type: "ol",
			props: { children: [{ type: "li", props: { value: 369, children: wrappedInlineElements } }] },
		});
	});
	test("BLOCKQUOTE", () => {
		// Single line.
		expect(renderMarkup(">QUOTE")).toMatchObject(quoteElement);
		expect(renderMarkup("> QUOTE")).toMatchObject(quoteElement);
		expect(renderMarkup(">      QUOTE")).toMatchObject(quoteElement);

		// Multiline.
		expect(renderMarkup(">QUOTE1\n>\n>QUOTE2")).toMatchObject(quoteElements);
		expect(renderMarkup("> QUOTE1\n>\n> QUOTE2")).toMatchObject(quoteElements);
		expect(renderMarkup(">      QUOTE1\n>\n>      QUOTE2")).toMatchObject(quoteElements);
		expect(renderMarkup(">      QUOTE1\n> \n>      QUOTE2")).toMatchObject(quoteElements);
		expect(renderMarkup(">      QUOTE1\n>  \n>      QUOTE2")).toMatchObject(quoteElements);
		expect(renderMarkup(">      QUOTE1\n>      \n>      QUOTE2")).toMatchObject(quoteElements);
	});
	test("FENCED", () => {
		// Basic fenced block.
		expect(renderMarkup("```\nLINE1\nLINE2\n```")).toMatchObject(fencedElement);
		expect(renderMarkup("``````\nLINE1\nLINE2\n``````")).toMatchObject(fencedElement);
		expect(renderMarkup("~~~\nLINE1\nLINE2\n~~~")).toMatchObject(fencedElement);
		expect(renderMarkup("~~~~~~\nLINE1\nLINE2\n~~~~~~")).toMatchObject(fencedElement);
		expect(renderMarkup("\n\n\n```\nLINE1\nLINE2\n```")).toMatchObject(fencedElement); // Newlines before the open don't matter.
		expect(renderMarkup("```\nLINE1\nLINE2\n```    ")).toMatchObject(fencedElement); // Spaces after the close don't matter.
		expect(renderMarkup("```\nLINE1\nLINE2\n```    \n     ")).toMatchObject(fencedElement); // Spaces after the close don't matter.
		expect(renderMarkup("```\nLINE1\nLINE2\n```\n\n\n\n")).toMatchObject(fencedElement); // Spaces after the close don't matter.
		expect(renderMarkup("```\nLINE1\nLINE2")).toMatchObject(fencedElement); // No close (runs to the end of the string).

		// Extra whitespace (inside the fence) is kept (except for trailing spaces).
		const whitespaceElement = {
			type: "pre",
			props: { children: { type: "code", props: { children: "      LINE1\n\n      LINE2" } } },
		};
		expect(renderMarkup("```\n      LINE1      \n      \n      LINE2      \n```")).toMatchObject(whitespaceElement);
		expect(renderMarkup("~~~\n      LINE1      \n      \n      LINE2      \n~~~")).toMatchObject(whitespaceElement);
		expect(renderMarkup("```\n      LINE1      \n      \n      LINE2      ")).toMatchObject(whitespaceElement);
		expect(renderMarkup("~~~\n      LINE1      \n      \n      LINE2      ")).toMatchObject(whitespaceElement);

		// With filename.
		expect(renderMarkup("```file.js\nLINE1\nLINE2\n```")).toMatchObject(namedFencedElement);

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
		expect(renderMarkup("PARAGRAPH       ")).toMatchObject(paragraphElement); // Trailing spaces.
		expect(renderMarkup("       PARAGRAPH")).toMatchObject(paragraphElement); // Leading spaces.

		// Multiline.
		expect(renderMarkup(paragraphsMarkup)).toMatchObject(paragraphsElements); // Separated by two lines.
		expect(renderMarkup("PARAGRAPH1\n\n\n\n\n\nPARAGRAPH2")).toMatchObject(paragraphsElements); // Separated by lots of lines.
		expect(renderMarkup("PARAGRAPH1\n      \nPARAGRAPH2")).toMatchObject(paragraphsElements); // Separated by line made up of spaces.
		expect(renderMarkup("PARAGRAPH1\n      \n      \nPARAGRAPH2")).toMatchObject(paragraphsElements); // Separated by line made up of spaces.

		// Paragraphs can contain inlines.
		expect(renderMarkup(wrappedInlineMarkup)).toMatchObject({
			type: "p",
			props: { children: wrappedInlineElements },
		});

		// Blocks immediately after paragraphs break those paragraphs early.
		expect(renderMarkup("PARAGRAPH\n- ITEM")).toMatchObject([paragraphElement, { ...unorderedItemElement, key: 1 }]);
		expect(renderMarkup("PARAGRAPH\n1. ITEM")).toMatchObject([paragraphElement, { ...orderedItemElement, key: 1 }]);
		expect(renderMarkup("PARAGRAPH\n> QUOTE")).toMatchObject([paragraphElement, { ...quoteElement, key: 1 }]);
		expect(renderMarkup("PARAGRAPH\n```\nLINE1\nLINE2\n```")).toMatchObject([paragraphElement, { ...fencedElement, key: 1 }]);
	});
	test("Block combinations", () => {
		// Testing for things that are all 'block level'.
		const lines = [
			paragraphMarkup,
			"```\nLINE1\nLINE2\n```",
			paragraphMarkup,
			"- ITEM\n  - ITEM1\n  - ITEM2",
			paragraphMarkup,
			"1. PARENT1\n  1111. ITEM1\n  2222. ITEM2\n  3333. ITEM3\n2. PARENT2\n3. PARENT3",
			paragraphMarkup,
		];
		const elements = [
			{ ...paragraphElement, key: 0 },
			{ ...fencedElement, key: 1 },
			{ ...paragraphElement, key: 2 },
			{ ...nestedUnorderedItemElements, key: 3 },
			{ ...paragraphElement, key: 4 },
			{ ...nestedOrderedItemElements, key: 5 },
			{ ...paragraphElement, key: 6 },
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
		expect(() => renderToString(renderMarkup("PARAGRAPH") as MarkupElement)).not.toThrow();
		expect(() => renderToString(renderMarkup("- ITEM") as MarkupElement)).not.toThrow();
		expect(() => renderToString(renderMarkup("```\nCODE") as MarkupElement)).not.toThrow();
	});
});
describe("renderMarkup(): Weird cases", () => {
	test("Empty string is `null`", () => {
		expect(renderMarkup("")).toEqual(null);
		expect(renderMarkup("    ")).toEqual(null); // Strip spaces.
		expect(renderMarkup("\n\n\n")).toEqual(null); // Strip only newlines.
		expect(renderMarkup("\t\t\t")).toEqual(null); // Strip only tabs.
		expect(renderMarkup("\f")).toEqual(null); // Strip random spaces.
		expect(renderMarkup("\x04")).toEqual(null); // Strip random control chars.
	});
});
