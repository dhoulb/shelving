import { describe, expect, test } from "bun:test";
import type { ReactElement, ReactNode } from "react";
import type { Element, Elements } from "../index.js";
import { getElements, getElementText, queryElements } from "../index.js";

const P: Element = {
	key: null,
	type: "p",
	props: {
		children: "PARAGRAPH",
	},
};

const UL: Element = {
	key: null,
	type: "ul",
	props: {
		children: [
			{ key: null, type: "li", props: { children: "ITEM1" } },
			{ key: null, type: "li", props: { children: "ITEM2" } },
		],
	},
};

// Check our custom element types are assignable to React's types.
const a1: Element = { type: "div", key: null, props: {} };
const a2: ReactElement = a1;
const a3: ReactNode = a1;
const b1: Elements = { type: "div", key: null, props: {} };
const b2: ReactNode = b1;

describe("getElementText()", () => {
	test("elements can be converted to plain text", () => {
		expect(getElementText(P)).toBe("PARAGRAPH");
		expect(getElementText(UL)).toBe("ITEM1 ITEM2");
	});
});
test("getElements()", () => {
	expect(Array.from(getElements(P))).toMatchObject([{ type: "p" }]);
	expect(Array.from(getElements(UL))).toMatchObject([
		{ type: "ul" },
		{ type: "li", props: { children: "ITEM1" } },
		{ type: "li", props: { children: "ITEM2" } },
	]);
});

describe("queryElements()", () => {
	const TREE: Element = {
		key: "root",
		type: "tree-directory",
		props: {
			children: [
				{ key: "file1", type: "tree-file", props: {} },
				{
					key: "sub",
					type: "tree-directory",
					props: {
						children: [
							{ key: "file2", type: "tree-file", props: {} },
							{ key: "deep", type: "tree-directory", props: { children: [{ key: "file3", type: "tree-file", props: {} }] } },
						],
					},
				},
				{ key: "func1", type: "tree-function", props: {} },
			],
		},
	};

	test("filters elements by type", () => {
		const result = queryElements(TREE, el => el.type === "tree-directory");
		expect(result).toMatchObject({
			type: "tree-directory",
			props: { children: [{ key: "sub", type: "tree-directory" }] },
		});
	});

	test("respects depth limit", () => {
		const result = queryElements(TREE, el => el.type === "tree-directory" || el.type === "tree-file", 1) as Element;
		// Depth 1 means children of root are included but their children are not recursed.
		const sub = (result.props.children as Element[]).find(c => c.key === "sub") as Element;
		expect(sub).toBeDefined();
		expect(sub.type).toBe("tree-directory");
	});

	test("returns undefined for no matches", () => {
		const result = queryElements(TREE, el => el.type === "nonexistent");
		expect(result).toBeUndefined();
	});

	test("passes through strings unchanged", () => {
		const result = queryElements("hello", el => el.type === "tree-file");
		expect(result).toBe("hello");
	});

	test("passes through null/undefined unchanged", () => {
		expect(queryElements(null, el => el.type === "tree-file")).toBeNull();
		expect(queryElements(undefined, el => el.type === "tree-file")).toBeUndefined();
	});
});
