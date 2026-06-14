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
});
