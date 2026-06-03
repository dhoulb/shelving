import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DocumentationElement, TreeElement } from "../../util/tree.js";
import { MetaContext } from "../misc/MetaContext.js";
import { TreeProvider } from "../tree/TreeContext.js";
import { createMeta } from "../util/meta.js";
import { DocumentationButtons } from "./DocumentationButtons.js";

/** Tree containing an `AbstractStore.get` method so qualified references resolve to a link. */
const get: DocumentationElement = {
	type: "tree-documentation",
	key: "get",
	props: { name: "get", kind: "method", class: "AbstractStore" },
};
const abstractStore: DocumentationElement = {
	type: "tree-documentation",
	key: "abstract-store",
	props: { name: "AbstractStore", kind: "class", children: [get] },
};
const tree: TreeElement = {
	type: "tree-directory",
	key: "root",
	props: { name: "shelving", children: [abstractStore] },
};

/** Render `children` inside the meta + tree contexts the buttons need to resolve links. */
function render(children: ReactNode): string {
	return renderToStaticMarkup(
		<MetaContext value={createMeta({ root: "http://x.com/", url: "./" })}>
			<TreeProvider tree={tree}>{children}</TreeProvider>
		</MetaContext>,
	);
}

describe("DocumentationButtons", () => {
	test("renders nothing when there are no relations", () => {
		expect(render(<DocumentationButtons />)).toBe("");
	});

	test("links a resolvable override to its page and labels it", () => {
		const html = render(<DocumentationButtons overrides="AbstractStore.get" class="MemoryStore" />);
		expect(html).toContain("overrides AbstractStore.get");
		// `AbstractStore.get` resolves to `/AbstractStore/get`.
		expect(html).toContain('href="http://x.com/AbstractStore/get"');
		// `member of MemoryStore` has no matching element → rendered as a disabled (non-link) label.
		expect(html).toContain("member of MemoryStore");
	});

	test("renders an unresolved reference (e.g. a builtin) as a non-link label", () => {
		const html = render(<DocumentationButtons implements={["Serializable"]} />);
		expect(html).toContain("implements Serializable");
		// No href for the builtin — it falls back to a disabled button.
		expect(html).not.toContain("Serializable</a>");
	});
});
