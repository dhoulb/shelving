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

test("UNORDERED loose lists", () => {
	// Items separated by a blank line make the whole list "loose" — each item is wrapped in `<p>`.
	expect(PARSER.parse("- ITEM1\n\n- ITEM2")).toMatchObject({
		type: "ul",
		props: {
			children: [
				{ type: "li", props: { children: { type: "p", props: { children: "ITEM1" } } } },
				{ type: "li", props: { children: { type: "p", props: { children: "ITEM2" } } } },
			],
		},
	});

	// Works with any bullet symbol.
	expect(PARSER.parse("* ITEM1\n\n* ITEM2")).toMatchObject({
		type: "ul",
		props: {
			children: [
				{ type: "li", props: { children: { type: "p", props: { children: "ITEM1" } } } },
				{ type: "li", props: { children: { type: "p", props: { children: "ITEM2" } } } },
			],
		},
	});

	// A loose item can contain multiple paragraphs from indented continuation lines.
	expect(PARSER.parse("- ITEM1\n\n  CONTINUED\n- ITEM2")).toMatchObject({
		type: "ul",
		props: {
			children: [
				{
					type: "li",
					props: {
						children: [
							{ type: "p", props: { children: "ITEM1" } },
							{ type: "p", props: { children: "CONTINUED" } },
						],
					},
				},
				{ type: "li", props: { children: { type: "p", props: { children: "ITEM2" } } } },
			],
		},
	});

	// A list with no blank lines stays "tight" — items are not wrapped in `<p>`.
	expect(PARSER.parse("- ITEM1\n- ITEM2")).toMatchObject({
		type: "ul",
		props: {
			children: [
				{ type: "li", props: { children: "ITEM1" } },
				{ type: "li", props: { children: "ITEM2" } },
			],
		},
	});

	// Two blank lines end the list — `\n\n\n` splits it into two separate lists.
	expect(PARSER.parse("- ITEM1\n\n\n- ITEM2")).toMatchObject([
		{ type: "ul", props: { children: [{ type: "li", props: { children: "ITEM1" } }] } },
		{ type: "ul", props: { children: [{ type: "li", props: { children: "ITEM2" } }] } },
	]);

	// A loose list can contain a nested (tight) sub-list.
	expect(PARSER.parse("- ITEM1\n\t- SUB1\n\t- SUB2\n\n- ITEM2")).toMatchObject({
		type: "ul",
		props: {
			children: [
				{
					type: "li",
					props: {
						children: [
							{ type: "p", props: { children: "ITEM1" } },
							{
								type: "ul",
								props: {
									children: [
										{ type: "li", props: { children: "SUB1" } },
										{ type: "li", props: { children: "SUB2" } },
									],
								},
							},
						],
					},
				},
				{ type: "li", props: { children: { type: "p", props: { children: "ITEM2" } } } },
			],
		},
	});
});
