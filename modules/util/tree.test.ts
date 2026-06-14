import { describe, expect, test } from "bun:test";
import type { DocumentationElement, TreeElement } from "../index.js";
import { flattenTree, walkElements } from "../index.js";

/** First child of a tree element (children are an `Elements` iterable, not necessarily an array). */
function firstChild(element: TreeElement | undefined): TreeElement | undefined {
	return element ? (Array.from(walkElements(element.props.children))[0] as TreeElement | undefined) : undefined;
}

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

describe("flattenTree()", () => {
	test("stamps `/` on the root and a prefixed canonical path on every descendant", () => {
		const map = flattenTree(PATH_TREE);
		expect(map.get("/")?.props.path).toBe("/");
		expect(map.get("schema")?.props.path).toBe("/schema");
		expect(map.get("BooleanSchema")?.props.path).toBe("/schema/BooleanSchema");
		expect(map.get("BooleanSchema.validate")?.props.path).toBe("/schema/BooleanSchema/validate");
	});

	test("a composite module name becomes a multi-segment path chunk", () => {
		const map = flattenTree(PATH_TREE);
		expect(map.get("util/string")?.props.path).toBe("/util/string");
	});

	test("registers every element under its flat key", () => {
		const map = flattenTree(PATH_TREE);
		expect(map.get("schema")?.key).toBe("schema");
		expect(map.get("BooleanSchema")?.key).toBe("BooleanSchema");
		// Class members are keyed `Class.member`, never the bare member name.
		expect(map.get("BooleanSchema.validate")?.key).toBe("validate");
		expect(map.get("validate")).toBeUndefined();
	});

	test("registers every element under its canonical path too", () => {
		const map = flattenTree(PATH_TREE);
		expect(map.get("/")?.key).toBe("shelving");
		expect(map.get("/schema/BooleanSchema")?.key).toBe("BooleanSchema");
		expect(map.get("/schema/BooleanSchema/validate")?.key).toBe("validate");
	});

	test("the stamped value keeps its (stamped) children, so the map doubles as the nested tree", () => {
		const map = flattenTree(PATH_TREE);
		const schema = firstChild(map.get("/"));
		expect(schema?.key).toBe("schema");
		expect(schema?.props.path).toBe("/schema");
		// The same stamped element is reachable both ways.
		expect(schema).toBe(map.get("/schema"));
	});

	test("does not mutate the original tree", () => {
		flattenTree(PATH_TREE);
		expect(PATH_TREE.props.path).toBeUndefined();
		expect(firstChild(PATH_TREE)?.props.path).toBeUndefined();
	});

	test("merges onto a base map without mutating it", () => {
		const base = new Map<string, TreeElement>([["existing", PATH_TREE]]);
		const map = flattenTree(PATH_TREE, base);
		expect(map.get("existing")).toBe(PATH_TREE);
		expect(map.get("schema")).toBeDefined();
		expect(base.has("schema")).toBe(false);
	});
});
