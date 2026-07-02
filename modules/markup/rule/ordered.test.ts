import { expect, test } from "bun:test";
import { MarkupParser } from "shelving/markup";

const PARSER = new MarkupParser();

test("ORDERED", () => {
	const ORDERED_ITEMS = {
		type: "ol",
		props: {
			children: [
				{ type: "li", props: { value: 1111, children: "ITEM1" } },
				{ type: "li", props: { value: 2222, children: "ITEM2" } },
				{ type: "li", props: { value: 3333, children: "ITEM3" } },
			],
		},
	};

	// Single item.
	expect(PARSER.parse("1. ITEM")).toMatchObject({
		type: "ol",
		props: {
			children: [{ type: "li", props: { value: 1, children: "ITEM" } }],
		},
	});
	expect(PARSER.parse("1) ITEM")).toMatchObject({
		type: "ol",
		props: {
			children: [{ type: "li", props: { value: 1, children: "ITEM" } }],
		},
	});
	expect(PARSER.parse("1: ITEM")).toMatchObject({
		type: "ol",
		props: {
			children: [{ type: "li", props: { value: 1, children: "ITEM" } }],
		},
	});
	expect(PARSER.parse("2222. ITEM")).toMatchObject({
		type: "ol",
		props: { children: [{ type: "li", props: { value: 2222, children: "ITEM" } }] },
	});

	// Multiple items.
	expect(PARSER.parse("1111. ITEM1\n2222. ITEM2\n3333. ITEM3")).toMatchObject(ORDERED_ITEMS);

	// Nested.
	expect(PARSER.parse("1. PARENT1\n\t1111. ITEM1\n\t2222. ITEM2\n\t3333. ITEM3\n2. PARENT2\n3. PARENT3")).toMatchObject({
		type: "ol",
		props: {
			children: [
				{ type: "li", props: { value: 1, children: ["PARENT1", ORDERED_ITEMS] } },
				{ type: "li", props: { value: 2, children: "PARENT2" } },
				{ type: "li", props: { value: 3, children: "PARENT3" } },
			],
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

	// List items trim whitespace.
	expect(PARSER.parse("1.    ITEM1    ")).toMatchObject({
		type: "ol",
		props: {
			children: [{ type: "li", props: { value: 1, children: "ITEM1" } }],
		},
	});
	expect(PARSER.parse("1.\t\tITEM1\t\t")).toMatchObject({
		type: "ol",
		props: {
			children: [{ type: "li", props: { value: 1, children: "ITEM1" } }],
		},
	});

	// List items can be empty.
	expect(PARSER.parse("1. ITEM1\n2.    \n3. ITEM3")).toMatchObject({
		type: "ol",
		props: {
			children: [
				{ type: "li", props: { value: 1, children: "ITEM1" } },
				{ type: "li", props: { value: 2, children: null } },
				{ type: "li", props: { value: 3, children: "ITEM3" } },
			],
		},
	});
	expect(PARSER.parse("2.    ")).toMatchObject({
		type: "ol",
		props: {
			children: [{ type: "li", props: { value: 2, children: null } }],
		},
	});
	expect(PARSER.parse("2.")).toMatchObject({
		type: "ol",
		props: {
			children: [{ type: "li", props: { value: 2, children: null } }],
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
	expect(PARSER.parse("369. BEFORE **STRONG** AFTER")).toMatchObject({
		type: "ol",
		props: {
			children: [{ type: "li", props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] } }],
		},
	});
});

test("ORDERED loose lists", () => {
	// Items separated by a blank line make the whole list "loose" — each item is wrapped in `<p>`.
	expect(PARSER.parse("1. ITEM1\n\n2. ITEM2")).toMatchObject({
		type: "ol",
		props: {
			children: [
				{ type: "li", props: { value: 1, children: { type: "p", props: { children: "ITEM1" } } } },
				{ type: "li", props: { value: 2, children: { type: "p", props: { children: "ITEM2" } } } },
			],
		},
	});

	// A loose item can contain multiple paragraphs from indented continuation lines.
	expect(PARSER.parse("1. ITEM1\n\n   CONTINUED\n2. ITEM2")).toMatchObject({
		type: "ol",
		props: {
			children: [
				{
					type: "li",
					props: {
						value: 1,
						children: [
							{ type: "p", props: { children: "ITEM1" } },
							{ type: "p", props: { children: "CONTINUED" } },
						],
					},
				},
				{ type: "li", props: { value: 2, children: { type: "p", props: { children: "ITEM2" } } } },
			],
		},
	});

	// A list with no blank lines stays "tight" — items are not wrapped in `<p>`.
	expect(PARSER.parse("1. ITEM1\n2. ITEM2")).toMatchObject({
		type: "ol",
		props: {
			children: [
				{ type: "li", props: { value: 1, children: "ITEM1" } },
				{ type: "li", props: { value: 2, children: "ITEM2" } },
			],
		},
	});

	// Two blank lines end the list — `\n\n\n` splits it into two separate lists.
	expect(PARSER.parse("1. ITEM1\n\n\n2. ITEM2")).toMatchObject([
		{ type: "ol", props: { children: [{ type: "li", props: { value: 1, children: "ITEM1" } }] } },
		{ type: "ol", props: { children: [{ type: "li", props: { value: 2, children: "ITEM2" } }] } },
	]);
});
