import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DocumentationElement } from "../../util/tree.js";
import { MetaContext } from "../misc/MetaContext.js";
import { createMeta } from "../util/meta.js";
import { DocumentationHomePage } from "./DocumentationHomePage.js";

/** Make a minimal `kind: "module"` child element. */
function mod(name: string): DocumentationElement {
	return { type: "tree-documentation", key: name, props: { name, kind: "module" } };
}

/** Render inside a `MetaContext` — the child cards read the current URL from it. */
function render(node: ReactNode, url = "./"): string {
	return renderToStaticMarkup(<MetaContext value={createMeta({ root: "http://x.com/", url })}>{node}</MetaContext>);
}

describe("DocumentationHomePage", () => {
	test("renders the title as a hero and lists the modules", () => {
		const html = render(
			<DocumentationHomePage name="shelving" title="shelving">
				{[mod("util"), mod("schema")]}
			</DocumentationHomePage>,
		);
		expect(html).toContain("shelving");
		expect(html).toContain("util");
		expect(html).toContain("schema");
	});

	test("falls back to `name` when no `title` is set", () => {
		const html = render(<DocumentationHomePage name="shelving">{[mod("util")]}</DocumentationHomePage>);
		expect(html).toContain("shelving");
	});
});
