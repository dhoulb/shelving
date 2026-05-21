import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { DocumentationElement } from "../../util/element.js";
import { TreeCards } from "./TreeCards.js";

/** Make a minimal `tree-documentation` element for a given kind. */
function doc(name: string, kind: string): DocumentationElement {
	return { type: "tree-documentation", key: name, props: { name, kind } };
}

describe("TreeCards", () => {
	test("renders a flat stack with no headings when not grouped", () => {
		const html = renderToStaticMarkup(<TreeCards path="/util/array">{[doc("getFirst", "function")]}</TreeCards>);
		expect(html).not.toContain("<h2");
	});

	test("groups documentation children into kind-based sections, in order", () => {
		const html = renderToStaticMarkup(
			<TreeCards path="/util/array" grouped>
				{[doc("getFirst", "function"), doc("ArrayStore", "class"), doc("getLast", "function")]}
			</TreeCards>,
		);
		expect(html).toContain("<h2");
		expect(html).toContain("Functions");
		expect(html).toContain("Classes");
		// Sections render in `KIND_SECTIONS` order — functions before classes.
		expect(html.indexOf("Functions")).toBeLessThan(html.indexOf("Classes"));
	});

	test("renders a heading only for non-empty groups", () => {
		const html = renderToStaticMarkup(
			<TreeCards path="/util/array" grouped>
				{[doc("getFirst", "function")]}
			</TreeCards>,
		);
		expect(html).toContain("Functions");
		expect(html).not.toContain("Classes");
		expect(html).not.toContain("Properties");
	});
});
