import { expect, test } from "bun:test";
import { MarkupParser } from "../index.js";

const PARSER = new MarkupParser();

test("UNORDERED", () => {
	const UNORDERED_ITEMS = {
		type: "ul",
		props: {
			children: [
				{ type: "li", props: { children: "ITEM1" } },
				{ type: "li", props: { children: "ITEM2" } },
			],
		},
	};

	// Flat.
	expect(PARSER.parse("- ITEM")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: "ITEM" } }],
		},
	});
	expect(PARSER.parse("* ITEM")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: "ITEM" } }],
		},
	});
	expect(PARSER.parse("+ ITEM")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: "ITEM" } }],
		},
	});
	expect(PARSER.parse("• ITEM")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: "ITEM" } }],
		},
	});

	// Multiple.
	expect(PARSER.parse("- ITEM1\n- ITEM2")).toMatchObject(UNORDERED_ITEMS);
	expect(PARSER.parse("* ITEM1\n* ITEM2")).toMatchObject(UNORDERED_ITEMS);
	expect(PARSER.parse("+ ITEM1\n+ ITEM2")).toMatchObject(UNORDERED_ITEMS);
	expect(PARSER.parse("• ITEM1\n• ITEM2")).toMatchObject(UNORDERED_ITEMS);

	// Nested.
	expect(PARSER.parse("- ITEM\n\t- ITEM1\n\t- ITEM2")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: ["ITEM", UNORDERED_ITEMS] } }],
		},
	});

	// List items can be empty.
	expect(PARSER.parse("- ITEM1\n-\n- ITEM3")).toMatchObject({
		type: "ul",
		props: {
			children: [
				{ type: "li", props: { children: "ITEM1" } },
				{ type: "li", props: { children: null } },
				{ type: "li", props: { children: "ITEM3" } },
			],
		},
	});
	expect(PARSER.parse("- ITEM1\n-    \n- ITEM3")).toMatchObject({
		type: "ul",
		props: {
			children: [
				{ type: "li", props: { children: "ITEM1" } },
				{ type: "li", props: { children: null } },
				{ type: "li", props: { children: "ITEM3" } },
			],
		},
	});

	// List items trim whitespace.
	expect(PARSER.parse("-    ITEM1    ")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: "ITEM1" } }],
		},
	});
	expect(PARSER.parse("- \t\tITEM1\t\t")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: "ITEM1" } }],
		},
	});

	// List items can be empty.
	expect(PARSER.parse("- ITEM1\n-    \n- ITEM3")).toMatchObject({
		type: "ul",
		props: {
			children: [
				{ type: "li", props: { children: "ITEM1" } },
				{ type: "li", props: { children: null } },
				{ type: "li", props: { children: "ITEM3" } },
			],
		},
	});
	expect(PARSER.parse("-    ")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: null } }],
		},
	});
	expect(PARSER.parse("-")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: null } }],
		},
	});

	// Newlines before/after are stripped.
	expect(PARSER.parse("\n    \n1. ITEM1\n    \n")).toMatchObject({
		type: "ol",
		props: {
			children: [{ type: "li", props: { value: 1, children: "ITEM1" } }],
		},
	});

	// List items can contain inlines.
	expect(PARSER.parse("- BEFORE **STRONG** AFTER")).toMatchObject({
		type: "ul",
		props: {
			children: [{ type: "li", props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] } }],
		},
	});
});
