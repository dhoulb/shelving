import { describe, expect, test } from "bun:test";
import type { ReactElement, ReactNode } from "react";
import type { Data, Element, Elements, TreeElement } from "../index.js";
import { filterElements, getElementPaths, getElementText, queryElements, resolveElementPath, walkElements } from "../index.js";

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

// `Element` → `ReactElement` works (see `a2` above). The reverse does NOT: `ReactElement` lacks the
// string index signature `Element` needs for `Data`, and even with that removed `Element`'s `Elements`
// content model is narrower than React's `ReactNode` (no `number` / `boolean` / `Promise`).
// @ts-expect-error — documents the one-way gap; remove this line if `Element` is ever unified with `ReactElement`.
const d1: Element = {} as ReactElement;

describe("getElementText()", () => {
	test("elements can be converted to plain text", () => {
		expect(getElementText(P)).toBe("PARAGRAPH");
		expect(getElementText(UL)).toBe("ITEM1ITEM2");
	});
	test("keeps loose text that sits alongside elements", () => {
		const MIXED: Element = {
			key: null,
			type: "p",
			props: { children: ["Use ", { key: null, type: "code", props: { children: "code" } }, " here."] },
		};
		expect(getElementText(MIXED)).toBe("Use code here.");
	});
	test("a <br> element becomes a newline", () => {
		const BROKEN: Element = {
			key: null,
			type: "p",
			props: { children: ["before", { key: null, type: "br", props: {} }, "after"] },
		};
		expect(getElementText(BROKEN)).toBe("before\nafter");
	});
});

describe("walkElements()", () => {
	test("yields a single element as one entry", () => {
		expect(Array.from(walkElements(P))).toMatchObject([{ type: "p" }]);
		expect(Array.from(walkElements(UL))).toMatchObject([{ type: "ul" }]);
	});

	test("does NOT recurse into an element's props.children", () => {
		// UL's children are <li> items — they should NOT appear in the output.
		const result = Array.from(walkElements(UL));
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({ type: "ul" });
	});

	test("flattens deeply-nested iterables of elements", () => {
		const nested = [P, [UL, [P]]] as Elements;
		const result = Array.from(walkElements(nested));
		expect(result).toMatchObject([{ type: "p" }, { type: "ul" }, { type: "p" }]);
	});

	test("skips strings, null, undefined", () => {
		expect(Array.from(walkElements(null))).toHaveLength(0);
		expect(Array.from(walkElements(undefined))).toHaveLength(0);
		expect(Array.from(walkElements("hello"))).toHaveLength(0);
		expect(Array.from(walkElements([null, undefined, "x", P] as Elements))).toMatchObject([{ type: "p" }]);
	});
});

const TREE: Element = {
	key: "root",
	type: "tree-directory",
	props: {
		children: [
			{ key: "file1", type: "tree-file", props: {} },
			{ key: "func1", type: "tree-documentation", props: {} },
		],
	},
};

describe("queryElements()", () => {
	test("filters direct children by type string", () => {
		const result = Array.from(queryElements(TREE.props.children, { type: "tree-file" }));
		expect(result).toMatchObject([{ key: "file1", type: "tree-file" }]);
	});

	test("filters direct children by type array", () => {
		const result = Array.from(queryElements(TREE.props.children, { type: ["tree-file", "tree-documentation"] }));
		expect(result).toMatchObject([
			{ key: "file1", type: "tree-file" },
			{ key: "func1", type: "tree-documentation" },
		]);
	});

	test("yields nothing for no matches", () => {
		expect(Array.from(queryElements(TREE.props.children, { type: "nonexistent" }))).toHaveLength(0);
	});
});

describe("filterElements()", () => {
	test("yields only matching elements (one level)", () => {
		const result = Array.from(filterElements(TREE.props.children, el => el.type === "tree-file"));
		expect(result).toMatchObject([{ key: "file1", type: "tree-file" }]);
	});

	test("yields nothing for no matches", () => {
		const result = Array.from(filterElements(TREE.props.children, el => el.type === "nonexistent"));
		expect(result).toHaveLength(0);
	});

	test("yields nothing for null/undefined/string input", () => {
		expect(Array.from(filterElements(null, el => el.type === "tree-file"))).toHaveLength(0);
		expect(Array.from(filterElements(undefined, el => el.type === "tree-file"))).toHaveLength(0);
		expect(Array.from(filterElements("hello", el => el.type === "tree-file"))).toHaveLength(0);
	});
});

const RESOLVE_TREE: TreeElement = {
	key: "modules",
	type: "tree-directory",
	props: {
		name: "modules",
		children: [
			{
				key: "util",
				type: "tree-directory",
				props: {
					name: "util",
					children: [
						{ key: "array", type: "tree-file", props: { name: "array", title: "Array" } },
						{ key: "string", type: "tree-file", props: { name: "string", title: "String" } },
					],
				},
			},
			{ key: "README", type: "tree-file", props: { name: "README", title: "README" } },
		],
	},
};

describe("resolveElementPath()", () => {
	test("returns the root itself for an empty path", () => {
		expect(resolveElementPath(RESOLVE_TREE, [])).toMatchObject({ key: "modules", type: "tree-directory" });
	});

	test("resolves a descendant by key", () => {
		expect(resolveElementPath(RESOLVE_TREE, ["util"])).toMatchObject({ key: "util", type: "tree-directory" });
		expect(resolveElementPath(RESOLVE_TREE, ["util", "array"])).toMatchObject({ key: "array", props: { title: "Array" } });
	});

	test("does not match the root's own key", () => {
		expect(resolveElementPath(RESOLVE_TREE, ["modules"])).toBeUndefined();
	});

	test("returns undefined for non-existent keys", () => {
		expect(resolveElementPath(RESOLVE_TREE, ["nonexistent"])).toBeUndefined();
		expect(resolveElementPath(RESOLVE_TREE, ["util", "nonexistent"])).toBeUndefined();
	});
});

describe("getElementPaths()", () => {
	test("yields the root as [] plus every descendant relative to it", () => {
		const keys = Array.from(getElementPaths(RESOLVE_TREE));
		expect(keys).toEqual([[], ["util"], ["util", "array"], ["util", "string"], ["README"]]);
	});
});
