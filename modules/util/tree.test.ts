import { describe, expect, test } from "bun:test";
import type { DocumentationElement, TreeElement } from "../index.js";
import { flattenTree, getTreePaths, resolveTreePath, stampTreePaths } from "../index.js";

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

// Tree with a composite module name and a class member, for path/flatten tests.
const PATH_TREE: TreeElement = {
	key: "shelving",
	type: "tree-element",
	props: {
		name: "shelving",
		children: [
			{
				key: "schema",
				type: "tree-documentation",
				props: {
					name: "schema",
					kind: "module",
					children: [
						{
							key: "BooleanSchema",
							type: "tree-documentation",
							props: {
								name: "BooleanSchema",
								kind: "class",
								children: [
									{
										key: "validate",
										type: "tree-documentation",
										props: { name: "validate", kind: "method", class: "BooleanSchema" },
									} as DocumentationElement,
								],
							},
						} as DocumentationElement,
					],
				},
			} as DocumentationElement,
			{ key: "util/string", type: "tree-documentation", props: { name: "util/string", kind: "module" } } as DocumentationElement,
		],
	},
};

describe("stampTreePaths()", () => {
	test("stamps `/` on the root and a prefixed path on every descendant", () => {
		const stamped = stampTreePaths(PATH_TREE);
		expect(stamped.props.path).toBe("/");
		const schema = resolveTreePath(stamped, ["schema"]);
		expect(schema?.props.path).toBe("/schema");
		const cls = resolveTreePath(stamped, ["schema", "BooleanSchema"]);
		expect(cls?.props.path).toBe("/schema/BooleanSchema");
		const member = resolveTreePath(stamped, ["schema", "BooleanSchema", "validate"]);
		expect(member?.props.path).toBe("/schema/BooleanSchema/validate");
	});

	test("a composite module name becomes a multi-segment path chunk", () => {
		const stamped = stampTreePaths(PATH_TREE);
		const mod = resolveTreePath(stamped, ["util", "string"]);
		expect(mod?.props.path).toBe("/util/string");
	});

	test("does not mutate the original tree", () => {
		stampTreePaths(PATH_TREE);
		expect(PATH_TREE.props.path).toBeUndefined();
	});
});

describe("flattenTree()", () => {
	test("registers every element under its flat key", () => {
		const map = flattenTree(stampTreePaths(PATH_TREE));
		expect(map.get("schema")?.key).toBe("schema");
		expect(map.get("BooleanSchema")?.key).toBe("BooleanSchema");
		// Class members are keyed `Class.member`.
		expect(map.get("BooleanSchema.validate")?.key).toBe("validate");
		expect(map.get("validate")).toBeUndefined();
	});

	test("registers every element under its canonical path too", () => {
		const map = flattenTree(stampTreePaths(PATH_TREE));
		expect(map.get("/")?.key).toBe("shelving");
		expect(map.get("/schema/BooleanSchema")?.key).toBe("BooleanSchema");
		expect(map.get("/schema/BooleanSchema/validate")?.key).toBe("validate");
	});

	test("merges onto a base map without mutating it", () => {
		const base = new Map<string, TreeElement>([["existing", PATH_TREE]]);
		const map = flattenTree(stampTreePaths(PATH_TREE), base);
		expect(map.get("existing")).toBe(PATH_TREE);
		expect(map.get("schema")).toBeDefined();
		expect(base.has("schema")).toBe(false);
	});
});
