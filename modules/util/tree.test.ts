import { describe, expect, test } from "bun:test";
import type { DocumentationElement, TreeElement } from "../index.js";
import { flattenTree, searchTree, walkElements } from "../index.js";

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

// Tree with name/title/description/content props for ranking tests.
const SEARCH_TREE: TreeElement = {
	key: "root",
	type: "tree-element",
	props: {
		name: "root",
		children: [
			{ key: "store", type: "tree-documentation", props: { name: "Store", kind: "class" } } as DocumentationElement,
			{ key: "storeget", type: "tree-documentation", props: { name: "StoreGetter", kind: "class" } } as DocumentationElement,
			{ key: "bigstore", type: "tree-documentation", props: { name: "BigStorehouse", kind: "class" } } as DocumentationElement,
			{
				key: "title",
				type: "tree-documentation",
				props: { name: "Widget", title: "A Store widget", kind: "function" },
			} as DocumentationElement,
			{
				key: "desc",
				type: "tree-documentation",
				props: { name: "Gadget", description: "Holds a store of data", kind: "function" },
			} as DocumentationElement,
			{
				key: "content",
				type: "tree-documentation",
				props: { name: "Doohickey", content: "uses the store internally", kind: "method" },
			} as DocumentationElement,
			{ key: "miss", type: "tree-documentation", props: { name: "Unrelated", kind: "function" } } as DocumentationElement,
		],
	},
};

describe("searchTree()", () => {
	test("ranks exact name, then startsWith, then includes, above title/description/content", () => {
		const names = searchTree(SEARCH_TREE, "store").map(el => el.props.name);
		// Exact "Store" first, then "StoreGetter"/"BigStorehouse" (name hits), then title, description, content matches.
		expect(names[0]).toBe("Store");
		expect(names.indexOf("StoreGetter")).toBeLessThan(names.indexOf("Widget")); // name includes beats title.
		expect(names.indexOf("Widget")).toBeLessThan(names.indexOf("Gadget")); // title beats description.
		expect(names.indexOf("Gadget")).toBeLessThan(names.indexOf("Doohickey")); // description beats content.
	});

	test("startsWith outranks a mid-string includes", () => {
		const names = searchTree(SEARCH_TREE, "store").map(el => el.props.name);
		// "StoreGetter" starts with the token; "BigStorehouse" only includes it.
		expect(names.indexOf("StoreGetter")).toBeLessThan(names.indexOf("BigStorehouse"));
	});

	test("excludes non-matches", () => {
		const names = searchTree(SEARCH_TREE, "store").map(el => el.props.name);
		expect(names).not.toContain("Unrelated");
	});

	test("a name match beats a content-only match", () => {
		const names = searchTree(SEARCH_TREE, "store").map(el => el.props.name);
		expect(names.indexOf("Store")).toBeLessThan(names.indexOf("Doohickey"));
	});

	test("quoted phrases match literally and stack with bare words", () => {
		const names = searchTree(SEARCH_TREE, '"a store widget" gadget').map(el => el.props.name);
		// "Widget" matches the quoted phrase via its title; "Gadget" matches the bare word via its description.
		expect(names).toContain("Widget");
		expect(names).toContain("Gadget");
	});

	test("applies the `filter` query over props before ranking", () => {
		const names = searchTree(SEARCH_TREE, "store", { filter: { kind: "class" } }).map(el => el.props.name);
		expect(names).toContain("Store");
		expect(names).not.toContain("Widget"); // A function — filtered out before ranking.
	});

	test("respects `limit`", () => {
		expect(searchTree(SEARCH_TREE, "store", { limit: 2 })).toHaveLength(2);
	});

	test("an empty query returns the (filtered) candidates in tree order", () => {
		const all = searchTree(SEARCH_TREE, "");
		expect(all[0]?.props.name).toBe("Store");
		const classes = searchTree(SEARCH_TREE, "", { filter: { kind: "class" } }).map(el => el.props.name);
		expect(classes).toEqual(["Store", "StoreGetter", "BigStorehouse"]);
	});
});
