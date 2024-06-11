import { expect, test } from "bun:test";
import { MARKUP_RULES, renderMarkup } from "../index.js";

const $$typeof = Symbol.for("react.element");
const OPTIONS = {
	rules: MARKUP_RULES,
};

test("ORDERED", () => {
	const ORDERED_ITEMS = {
		$$typeof,
		type: "ol",
		props: {
			children: [
				{ $$typeof, type: "li", props: { value: 1111, children: "ITEM1" } },
				{ $$typeof, type: "li", props: { value: 2222, children: "ITEM2" } },
				{ $$typeof, type: "li", props: { value: 3333, children: "ITEM3" } },
			],
		},
	};

	// Single item.
	expect(renderMarkup("1. ITEM", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [{ $$typeof, type: "li", props: { value: 1, children: "ITEM" } }],
		},
	});
	expect(renderMarkup("1) ITEM", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [{ $$typeof, type: "li", props: { value: 1, children: "ITEM" } }],
		},
	});
	expect(renderMarkup("1: ITEM", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [{ $$typeof, type: "li", props: { value: 1, children: "ITEM" } }],
		},
	});
	expect(renderMarkup("2222. ITEM", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: { children: [{ $$typeof, type: "li", props: { value: 2222, children: "ITEM" } }] },
	});

	// Multiple items.
	expect(renderMarkup("1111. ITEM1\n2222. ITEM2\n3333. ITEM3", OPTIONS)).toMatchObject(ORDERED_ITEMS);

	// Nested.
	expect(renderMarkup("1. PARENT1\n\t1111. ITEM1\n\t2222. ITEM2\n\t3333. ITEM3\n2. PARENT2\n3. PARENT3", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [
				{ $$typeof, type: "li", props: { value: 1, children: ["PARENT1", ORDERED_ITEMS] } },
				{ $$typeof, type: "li", props: { value: 2, children: "PARENT2" } },
				{ $$typeof, type: "li", props: { value: 3, children: "PARENT3" } },
			],
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

	// List items trim whitespace.
	expect(renderMarkup("1.    ITEM1    ", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [{ $$typeof, type: "li", props: { value: 1, children: "ITEM1" } }],
		},
	});
	expect(renderMarkup("1.\t\tITEM1\t\t", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [{ $$typeof, type: "li", props: { value: 1, children: "ITEM1" } }],
		},
	});

	// List items can be empty.
	expect(renderMarkup("1. ITEM1\n2.    \n3. ITEM3", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [
				{ $$typeof, type: "li", props: { value: 1, children: "ITEM1" } },
				{ $$typeof, type: "li", props: { value: 2, children: null } },
				{ $$typeof, type: "li", props: { value: 3, children: "ITEM3" } },
			],
		},
	});
	expect(renderMarkup("2.    ", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [{ $$typeof, type: "li", props: { value: 2, children: null } }],
		},
	});
	expect(renderMarkup("2.", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [{ $$typeof, type: "li", props: { value: 2, children: null } }],
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
	expect(renderMarkup("369. BEFORE **STRONG** AFTER", OPTIONS)).toMatchObject({
		$$typeof,
		type: "ol",
		props: {
			children: [{ $$typeof, type: "li", props: { children: ["BEFORE ", { type: "strong", props: { children: "STRONG" } }, " AFTER"] } }],
		},
	});
});
