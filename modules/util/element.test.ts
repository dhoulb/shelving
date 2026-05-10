import { describe, expect, test } from "bun:test";
import type { ReactElement, ReactNode } from "react";
import type { Data, Element, Elements } from "../index.js";
import { filterElements, getElements, getElementText, queryElements, resolveElementPath } from "../index.js";

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

// Check Element satisfies Data (for queryItems compatibility).
const c1: Element = { type: "div", key: null, props: {} };
const c2: Data = c1;

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

describe("queryElements()", () => {
	test("queries elements by type using Query object", () => {
		const result = Array.from(queryElements(TREE, { type: "tree-directory" }));
		expect(result).toMatchObject([
			{ key: "root", type: "tree-directory" },
			{ key: "sub", type: "tree-directory" },
			{ key: "deep", type: "tree-directory" },
		]);
	});

	test("queries elements by type array (in filter)", () => {
		const result = Array.from(queryElements(TREE, { type: ["tree-file", "tree-function"] }));
		expect(result).toMatchObject([
			{ key: "file1", type: "tree-file" },
			{ key: "file2", type: "tree-file" },
			{ key: "file3", type: "tree-file" },
			{ key: "func1", type: "tree-function" },
		]);
	});

	test("respects depth limit", () => {
		const result = Array.from(queryElements(TREE, { type: "tree-file" }, 1));
		expect(result).toMatchObject([{ key: "file1" }]);
	});

	test("yields nothing for no matches", () => {
		expect(Array.from(queryElements(TREE, { type: "nonexistent" }))).toHaveLength(0);
	});
});

describe("filterElements()", () => {
	test("yields only matching elements", () => {
		const result = Array.from(filterElements(TREE, el => el.type === "tree-directory"));
		expect(result).toMatchObject([
			{ key: "root", type: "tree-directory" },
			{ key: "sub", type: "tree-directory" },
			{ key: "deep", type: "tree-directory" },
		]);
	});

	test("respects depth limit", () => {
		// Depth 0: only root level matches.
		const result0 = Array.from(filterElements(TREE, el => el.type === "tree-file", 0));
		expect(result0).toHaveLength(0); // root is tree-directory, no files at depth 0

		// Depth 1: root + immediate children.
		const result1 = Array.from(filterElements(TREE, el => el.type === "tree-file", 1));
		expect(result1).toMatchObject([{ key: "file1" }]);
	});

	test("yields nothing for no matches", () => {
		const result = Array.from(filterElements(TREE, el => el.type === "nonexistent"));
		expect(result).toHaveLength(0);
	});

	test("yields nothing for null/undefined/string input", () => {
		expect(Array.from(filterElements(null, el => el.type === "tree-file"))).toHaveLength(0);
		expect(Array.from(filterElements(undefined, el => el.type === "tree-file"))).toHaveLength(0);
		expect(Array.from(filterElements("hello", el => el.type === "tree-file"))).toHaveLength(0);
	});
});

describe("resolveElementPath()", () => {
	const TREE: Element[] = [
		{
			key: "util",
			type: "tree-directory",
			props: {
				children: [
					{ key: "array", type: "tree-file", props: { title: "Array" } },
					{ key: "string", type: "tree-file", props: { title: "String" } },
				],
			},
		},
		{ key: "readme", type: "tree-file", props: { title: "README" } },
	];

	test("resolves a single-segment path", () => {
		const result = resolveElementPath(TREE, "util");
		expect(result).toMatchObject({ key: "util", type: "tree-directory" });
	});

	test("resolves a multi-segment path", () => {
		const result = resolveElementPath(TREE, "util/array");
		expect(result).toMatchObject({ key: "array", type: "tree-file", props: { title: "Array" } });
	});

	test("returns first keyed element for empty path", () => {
		expect(resolveElementPath(TREE, "")).toMatchObject({ key: "util" });
		expect(resolveElementPath(TREE, undefined)).toMatchObject({ key: "util" });
	});

	test("returns undefined for non-existent path", () => {
		expect(resolveElementPath(TREE, "nonexistent")).toBeUndefined();
		expect(resolveElementPath(TREE, "util/nonexistent")).toBeUndefined();
	});
});
