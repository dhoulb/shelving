import { describe, expect, test } from "bun:test";
import type { DocumentationElement, TreeElement } from "../index.js";
import { flattenTree, getTreePaths, resolveTreePath } from "../index.js";

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

describe("resolveTreePath()", () => {
	test("returns the root itself for an empty path", () => {
		expect(resolveTreePath(RESOLVE_TREE, [])).toMatchObject({ key: "modules", type: "tree-directory" });
	});

	test("resolves a descendant by key", () => {
		expect(resolveTreePath(RESOLVE_TREE, ["util"])).toMatchObject({ key: "util", type: "tree-directory" });
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

const MAP_MEMBERS: DocumentationElement[] = [
	{ key: "get", type: "tree-documentation", props: { name: "get", title: "Store.get()", kind: "method", class: "Store" } },
	{ key: "set", type: "tree-documentation", props: { name: "set", title: "Store.set()", kind: "method", class: "Store" } },
];
const MAP_STORE: DocumentationElement = {
	key: "store",
	type: "tree-documentation",
	props: { name: "Store", kind: "class", children: MAP_MEMBERS },
};
const MAP_TREE: TreeElement = {
	key: "modules",
	type: "tree-directory",
	props: { name: "modules", title: "Modules", children: [MAP_STORE] },
};

describe("flattenTree()", () => {
	test("maps bare names, qualified Class.member keys, and joined paths to their entries", () => {
		const map = flattenTree(MAP_TREE);
		expect(map.get("Store")).toEqual({ path: ["Store"], title: "Store" });
		expect(map.get("get")).toEqual({ path: ["Store", "get"], title: "Store.get()" });
		expect(map.get("Store.get")).toEqual({ path: ["Store", "get"], title: "Store.get()" });
		expect(map.get("Store.set")).toEqual({ path: ["Store", "set"], title: "Store.set()" });
		// Joined-path key (reverse lookup for breadcrumbs), and the root under `""`.
		expect(map.get("Store/get")).toEqual({ path: ["Store", "get"], title: "Store.get()" });
		expect(map.get("")).toEqual({ path: [], title: "Modules" });
	});

	test("returns undefined for names not in the tree", () => {
		expect(flattenTree(MAP_TREE).get("Serializable")).toBeUndefined();
	});

	test("merges onto a base map, with the base winning on collision", () => {
		const base = new Map([["Store", { path: ["other", "Store"], title: "Other Store" }]]);
		const map = flattenTree(MAP_TREE, base);
		// Base entry wins for the colliding `Store` key, but new keys are still added.
		expect(map.get("Store")).toEqual({ path: ["other", "Store"], title: "Other Store" });
		expect(map.get("Store.get")).toEqual({ path: ["Store", "get"], title: "Store.get()" });
	});
});
