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

	test("yields only matching elements", () => {
		const result = Array.from(queryElements(TREE, el => el.type === "tree-directory"));
		expect(result).toMatchObject([
			{ key: "root", type: "tree-directory" },
			{ key: "sub", type: "tree-directory" },
			{ key: "deep", type: "tree-directory" },
		]);
	});

	test("respects depth limit", () => {
		// Depth 0: only root level matches.
		const result0 = Array.from(queryElements(TREE, el => el.type === "tree-file", 0));
		expect(result0).toHaveLength(0); // root is tree-directory, no files at depth 0

		// Depth 1: root + immediate children.
		const result1 = Array.from(queryElements(TREE, el => el.type === "tree-file", 1));
		expect(result1).toMatchObject([{ key: "file1" }]);
	});

	test("yields nothing for no matches", () => {
		const result = Array.from(queryElements(TREE, el => el.type === "nonexistent"));
		expect(result).toHaveLength(0);
	});

	test("yields nothing for null/undefined/string input", () => {
		expect(Array.from(queryElements(null, el => el.type === "tree-file"))).toHaveLength(0);
		expect(Array.from(queryElements(undefined, el => el.type === "tree-file"))).toHaveLength(0);
		expect(Array.from(queryElements("hello", el => el.type === "tree-file"))).toHaveLength(0);
	});
});
