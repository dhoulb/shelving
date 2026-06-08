import { describe, expect, test } from "bun:test";
import type { TreeElement } from "../index.js";
import { getTreePaths, resolveTreePath } from "../index.js";

const RESOLVE_TREE: TreeElement = {
	key: "modules",
	type: "tree-element",
	props: {
		name: "modules",
		children: [
			{
				key: "util",
				type: "tree-element",
				props: {
					name: "util",
					children: [
						{ key: "array", type: "tree-element", props: { name: "array", title: "Array" } },
						{ key: "string", type: "tree-element", props: { name: "string", title: "String" } },
					],
				},
			},
			{ key: "README", type: "tree-element", props: { name: "README", title: "README" } },
		],
	},
};

describe("resolveTreePath()", () => {
	test("returns the root itself for an empty path", () => {
		expect(resolveTreePath(RESOLVE_TREE, [])).toMatchObject({ key: "modules", type: "tree-element" });
	});

	test("resolves a descendant by key", () => {
		expect(resolveTreePath(RESOLVE_TREE, ["util"])).toMatchObject({ key: "util", type: "tree-element" });
		expect(resolveTreePath(RESOLVE_TREE, ["util", "array"])).toMatchObject({ key: "array", props: { title: "Array" } });
	});

	test("does not match the root's own key", () => {
		expect(resolveTreePath(RESOLVE_TREE, ["modules"])).toBeUndefined();
	});

	test("returns undefined for non-existent keys", () => {
		expect(resolveTreePath(RESOLVE_TREE, ["nonexistent"])).toBeUndefined();
		expect(resolveTreePath(RESOLVE_TREE, ["util", "nonexistent"])).toBeUndefined();
	});
});

describe("getTreePaths()", () => {
	test("yields the root as [] plus every descendant relative to it", () => {
		const keys = Array.from(getTreePaths(RESOLVE_TREE));
		expect(keys).toEqual([[], ["util"], ["util", "array"], ["util", "string"], ["README"]]);
	});
});

// TODO: `flattenTree()` tests removed temporarily — the map is mid-refactor to path-keyed `{ path, element }`
// entries (path-based linking). Re-add once the normalisation pass + path-keyed map land.
