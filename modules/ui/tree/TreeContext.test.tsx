import { describe, expect, test } from "bun:test";
import { getTreeElement } from "shelving/ui";
import { type DocumentationElement, flattenTree, type TreeElement } from "shelving/util/tree";

/** Tree spanning a module, a class with a member, a standalone function, and a component. */
const validate: DocumentationElement = {
	type: "tree-documentation",
	key: "validate",
	props: { name: "validate", kind: "method", class: "BooleanSchema" },
};
const booleanSchema: DocumentationElement = {
	type: "tree-documentation",
	key: "BooleanSchema",
	props: { name: "BooleanSchema", kind: "class", children: [validate] },
};
const formatDate: DocumentationElement = {
	type: "tree-documentation",
	key: "formatDate",
	props: { name: "formatDate", kind: "function" },
};
const section: DocumentationElement = {
	type: "tree-documentation",
	key: "Section",
	props: { name: "Section", kind: "component" },
};
const schema: TreeElement = {
	type: "tree-element",
	key: "schema",
	props: { name: "schema", children: [booleanSchema, formatDate, section] },
};
const tree: TreeElement = {
	type: "tree-element",
	key: "root",
	props: { name: "shelving", children: [schema] },
};
const map = flattenTree(tree);

describe("getTreeElement", () => {
	test("resolves an exact flat key and canonical path", () => {
		expect(getTreeElement(map, "BooleanSchema")).toBe(map.get("BooleanSchema"));
		expect(getTreeElement(map, "/schema/BooleanSchema")).toBe(map.get("BooleanSchema"));
	});

	test("strips call parens — empty or with example args — from a function/method reference", () => {
		expect(getTreeElement(map, "formatDate()")).toBe(map.get("formatDate"));
		expect(getTreeElement(map, "formatDate(value)")).toBe(map.get("formatDate"));
		expect(getTreeElement(map, "BooleanSchema.validate()")).toBe(map.get("BooleanSchema.validate"));
	});

	test("strips component angle brackets", () => {
		expect(getTreeElement(map, "<Section>")).toBe(map.get("Section"));
	});

	test("maps a module package prefix to its canonical path", () => {
		expect(getTreeElement(map, "shelving/schema")).toBe(map.get("/schema"));
	});

	test("strips a whole-string generic wrapper", () => {
		expect(getTreeElement(map, "BooleanSchema<T>")).toBe(map.get("BooleanSchema"));
	});

	test("falls back to the owner page when a qualified member has no page of its own", () => {
		// `BooleanSchema.format()` isn't a documented member, so it resolves to the `BooleanSchema` class.
		expect(getTreeElement(map, "BooleanSchema.format()")).toBe(map.get("BooleanSchema"));
	});

	test("leaves a compound or unknown reference unresolved", () => {
		expect(getTreeElement(map, "BooleanSchema<T> | null")).toBeUndefined();
		expect(getTreeElement(map, "string")).toBeUndefined();
		expect(getTreeElement(map, ".validate()")).toBeUndefined(); // bare member has no class context
	});
});
