import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DocumentationElement } from "../../util/tree.js";
import { MetaContext } from "../misc/MetaContext.js";
import { createMeta } from "../util/meta.js";
import { DocumentationPage } from "./DocumentationPage.js";

/** Make a minimal `tree-documentation` child element of a given kind. */
function doc(name: string, kind: string): DocumentationElement {
	return { type: "tree-documentation", key: name, props: { name, kind } };
}

/** Render inside a `MetaContext` — the page's `<TreeBreadcrumbs>` reads the current URL from it. */
function render(node: ReactNode, url = "./array"): string {
	return renderToStaticMarkup(<MetaContext value={createMeta({ root: "http://x.com/", url })}>{node}</MetaContext>);
}

describe("DocumentationPage", () => {
	test("groups child symbols into kind-based sections, in order", () => {
		const html = render(
			<DocumentationPage path="/array" name="array">
				{[doc("getThing", "function"), doc("Widget", "class"), doc("getOther", "function")]}
			</DocumentationPage>,
		);
		expect(html).toContain("Functions");
		expect(html).toContain("Classes");
		// Sections render in `KIND_SECTIONS` order — functions before classes.
		expect(html.indexOf("Functions")).toBeLessThan(html.indexOf("Classes"));
	});

	test("renders a section only for kinds that have children", () => {
		const html = render(
			<DocumentationPage path="/Store" name="Store" kind="class">
				{[doc("get", "method"), doc("size", "property")]}
			</DocumentationPage>,
			"./Store",
		);
		expect(html).toContain("Methods");
		expect(html).toContain("Properties");
		expect(html).not.toContain("Functions");
		expect(html).not.toContain("Interfaces");
	});

	test("renders parameters as a table, folding any default into the description as a `Defaults to …` line", () => {
		const html = render(
			<DocumentationPage
				path="/makeThing"
				name="makeThing"
				kind="function"
				params={[
					{ name: "name", type: "string", description: "The name." },
					{ name: "required", type: "boolean", description: "Whether required.", optional: true, default: "false" },
				]}
				returns={[{ type: "Thing", description: "The new thing." }]}
			/>,
			"./makeThing",
		);
		// Parameters table headers — name and type only; the default lives in the description column now (header cells carry a class, so match on the closing tag).
		expect(html).toContain(">Param</th>");
		expect(html).toContain(">Type</th>");
		expect(html).not.toContain(">Default</th>");
		// A param with a default surfaces it as a `Defaults to …` line in its description; one without adds nothing.
		expect(html).toContain("Defaults to");
		expect(html).toContain("false");
		// Returns table headers.
		expect(html).toContain(">Return</th>");
		expect(html).toContain("The new thing.");
	});

	test("groups static members into their own sections, before instance sections", () => {
		const html = render(
			<DocumentationPage path="/Color" name="Color" kind="class">
				{[doc("from", "static method"), doc("DEFAULT", "static property"), doc("toString", "method"), doc("red", "property")]}
			</DocumentationPage>,
			"./Color",
		);
		expect(html).toContain("Static methods");
		expect(html).toContain("Static properties");
		expect(html).toContain("Methods");
		expect(html).toContain("Properties");
		// Static sections render before their instance counterparts (the `Methods` / `Properties` headings use a capital, so they don't match inside `Static methods`).
		expect(html.indexOf("Static methods")).toBeLessThan(html.indexOf("Methods"));
		expect(html.indexOf("Static properties")).toBeLessThan(html.indexOf("Properties"));
	});
});
