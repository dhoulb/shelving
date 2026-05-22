import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { DocumentationElement } from "../../util/element.js";
import { MetaContext } from "../misc/MetaContext.js";
import { createMeta } from "../util/meta.js";
import { DocumentationPage } from "./DocumentationPage.js";

/** Make a minimal `tree-documentation` child element of a given kind. */
function doc(name: string, kind: string): DocumentationElement {
	return { type: "tree-documentation", key: name, props: { name, kind } };
}

describe("DocumentationPage", () => {
	test("groups child symbols into kind-based sections, in order", () => {
		const html = renderToStaticMarkup(
			<DocumentationPage name="array">
				{[doc("getThing", "function"), doc("Widget", "class"), doc("getOther", "function")]}
			</DocumentationPage>,
		);
		expect(html).toContain("Functions");
		expect(html).toContain("Classes");
		// Sections render in `KIND_SECTIONS` order — functions before classes.
		expect(html.indexOf("Functions")).toBeLessThan(html.indexOf("Classes"));
	});

	test("renders a section only for kinds that have children", () => {
		const html = renderToStaticMarkup(
			<DocumentationPage name="Store" kind="class">
				{[doc("get", "method"), doc("size", "property")]}
			</DocumentationPage>,
		);
		expect(html).toContain("Methods");
		expect(html).toContain("Properties");
		expect(html).not.toContain("Functions");
		expect(html).not.toContain("Interfaces");
	});

	test("card links resolve against the site root without doubling its subfolder", () => {
		// `root` has a `/sub/` subfolder and the page sits at `/sub/Store` — card hrefs must include `/sub/` exactly once.
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/sub/", url: "./Store" })}>
				<DocumentationPage name="Store" kind="class">
					{[doc("get", "method")]}
				</DocumentationPage>
			</MetaContext>,
		);
		expect(html).toContain('href="http://x.com/sub/Store/get"');
		expect(html).not.toContain("/sub/sub/");
	});
});
