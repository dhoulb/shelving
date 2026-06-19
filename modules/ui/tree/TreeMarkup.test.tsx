import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DocumentationElement, TreeElement } from "../../util/tree.js";
import { MetaContext } from "../misc/MetaContext.js";
import { createMeta } from "../util/meta.js";
import { TreeProvider } from "./TreeContext.js";
import { TreeMarkup } from "./TreeMarkup.js";

/** Tree with a single documented class so `Store` resolves to a canonical path. */
const store: DocumentationElement = {
	type: "tree-documentation",
	key: "Store",
	props: { name: "Store", kind: "class" },
};
const tree: TreeElement = {
	type: "tree-element",
	key: "root",
	props: { name: "shelving", children: [store] },
};

/** Render `children` inside the meta + tree contexts `<TreeMarkup>` needs to resolve links. */
function render(children: ReactNode): string {
	return renderToStaticMarkup(
		<MetaContext value={createMeta({ root: "http://x.com/", url: "./" })}>
			<TreeProvider tree={tree}>{children}</TreeProvider>
		</MetaContext>,
	);
}

describe("TreeMarkup", () => {
	test("links an inline code span that resolves to a tree element", () => {
		const html = render(<TreeMarkup>{"Use `Store` to hold state."}</TreeMarkup>);
		expect(html).toContain('href="http://x.com/Store"');
		expect(html).toContain("<code");
	});

	test("leaves an unresolved code span as a plain code token", () => {
		const html = render(<TreeMarkup>{"Run `bun run fix` first."}</TreeMarkup>);
		expect(html).toContain("bun run fix");
		expect(html).not.toContain("</a>"); // no link formed
	});

	test("still applies the standard markup rules around code spans", () => {
		const html = render(<TreeMarkup>{"This is *bold* and `Store`."}</TreeMarkup>);
		expect(html).toContain("<strong>bold</strong>");
		expect(html).toContain('href="http://x.com/Store"');
	});

	test("renders null for empty input", () => {
		expect(render(<TreeMarkup>{""}</TreeMarkup>)).toBe("");
	});
});
