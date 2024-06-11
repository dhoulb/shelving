import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("UNORDERED", () => {
	const UNORDERED_ITEMS = {
		$$typeof,
		type: "ul",
		props: {
			children: [
				{ $$typeof, type: "li", props: { children: "ITEM1" } },
				{ $$typeof, type: "li", props: { children: "ITEM2" } },
			],
		},
	};

	// Flat.
	expect(renderMarkup("- ITEM", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: "ITEM" } }],
		},
	});
	expect(renderMarkup("* ITEM", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: "ITEM" } }],
		},
	});
	expect(renderMarkup("+ ITEM", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: "ITEM" } }],
		},
	});
	expect(renderMarkup("• ITEM", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: "ITEM" } }],
		},
	});

	// Multiple.
	expect(renderMarkup("- ITEM1\n- ITEM2", OPTIONS)).toMatchObject(UNORDERED_ITEMS);
	expect(renderMarkup("* ITEM1\n* ITEM2", OPTIONS)).toMatchObject(UNORDERED_ITEMS);
	expect(renderMarkup("+ ITEM1\n+ ITEM2", OPTIONS)).toMatchObject(UNORDERED_ITEMS);
	expect(renderMarkup("• ITEM1\n• ITEM2", OPTIONS)).toMatchObject(UNORDERED_ITEMS);

	// Nested.
	expect(renderMarkup("- ITEM\n\t- ITEM1\n\t- ITEM2", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: ["ITEM", UNORDERED_ITEMS] } }],
		},
	});

	// List items can be empty.
	expect(renderMarkup("- ITEM1\n-\n- ITEM3", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [
				{ $$typeof, type: "li", props: { children: "ITEM1" } },
				{ $$typeof, type: "li", props: { children: null } },
				{ $$typeof, type: "li", props: { children: "ITEM3" } },
			],
		},
	});
	expect(renderMarkup("- ITEM1\n-    \n- ITEM3", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [
				{ $$typeof, type: "li", props: { children: "ITEM1" } },
				{ $$typeof, type: "li", props: { children: null } },
				{ $$typeof, type: "li", props: { children: "ITEM3" } },
			],
		},
	});

	// List items trim whitespace.
	expect(renderMarkup("-    ITEM1    ", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: "ITEM1" } }],
		},
	});
	expect(renderMarkup("- \t\tITEM1\t\t", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: "ITEM1" } }],
		},
	});

	// List items can be empty.
	expect(renderMarkup("- ITEM1\n-    \n- ITEM3", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [
				{ $$typeof, type: "li", props: { children: "ITEM1" } },
				{ $$typeof, type: "li", props: { children: null } },
				{ $$typeof, type: "li", props: { children: "ITEM3" } },
			],
		},
	});
	expect(renderMarkup("-    ", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: null } }],
		},
	});
	expect(renderMarkup("-", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: null } }],
		},
	});

	// Newlines before/after are stripped.
	expect(renderMarkup("\n    \n1. ITEM1\n    \n", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [{ $$typeof, type: "li", props: { value: 1, children: "ITEM1" } }],
		},
	});

	// List items can contain inlines.
	expect(renderMarkup("- BEFORE **STRONG** AFTER", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ul",
		props: {
			children: [{ $$typeof, type: "li", props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] } }],
		},
	});
});
