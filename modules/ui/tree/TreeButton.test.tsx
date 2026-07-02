import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMeta, MetaContext, TreeButton, TreeProvider } from "shelving/ui";
import type { DocumentationElement, TreeElement } from "shelving/util/tree";

/** Tree with a class member so both flat (`Store.get`) and canonical-path references resolve. */
const get: DocumentationElement = {
	type: "tree-documentation",
	key: "get",
	props: { name: "get", kind: "method", class: "Store", title: "Store.get()" },
};
const store: DocumentationElement = {
	type: "tree-documentation",
	key: "Store",
	props: { name: "Store", kind: "class", children: [get] },
};
const tree: TreeElement = {
	type: "tree-element",
	key: "root",
	props: { name: "shelving", children: [store] },
};

/** Render `children` inside the meta + tree contexts `<TreeButton>` needs to resolve links. */
function render(children: ReactNode): string {
	return renderToStaticMarkup(
		<MetaContext value={createMeta({ root: "http://x.com/", url: "./" })}>
			<TreeProvider tree={tree}>{children}</TreeProvider>
		</MetaContext>,
	);
}

describe("TreeButton", () => {
	test("links a flat-key reference to its element's canonical path", () => {
		const html = render(<TreeButton name="Store" />);
		expect(html).toContain('href="http://x.com/Store"');
	});

	test("links a qualified `Class.member` reference", () => {
		const html = render(<TreeButton name="Store.get" />);
		// `Store.get` resolves to `/Store/get`.
		expect(html).toContain('href="http://x.com/Store/get"');
	});

	test("resolves a canonical path reference too", () => {
		const html = render(<TreeButton name="/Store/get" />);
		expect(html).toContain('href="http://x.com/Store/get"');
	});

	test("falls back to the element's title, then to children, for its label", () => {
		expect(render(<TreeButton name="Store.get" />)).toContain("Store.get()"); // from `title`
		expect(render(<TreeButton name="Store.get">custom</TreeButton>)).toContain("custom"); // explicit child wins
	});

	test("renders an unresolved reference (e.g. a builtin) as a non-link label", () => {
		const html = render(<TreeButton name="Serializable" />);
		expect(html).toContain("Serializable"); // still reads as text
		expect(html).not.toContain("Serializable</a>"); // but is not a link
	});

	test("links a generic reference by its bare type name", () => {
		// `Store<T>` isn't a key, but stripping the generics resolves `Store`.
		const html = render(<TreeButton name="Store<T>" />);
		expect(html).toContain('href="http://x.com/Store"');
	});

	test("leaves a compound generic reference unresolved", () => {
		const html = render(<TreeButton name="Store<T> | null" />);
		expect(html).not.toContain("</a>"); // not `Identifier<…>`-shaped, so no link
	});
});
