import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createMeta, MetaContext, TreeProvider, TreeRouter } from "shelving/ui";
import type { TreeElement } from "shelving/util/tree";

/** Minimal tree: root → `util` directory → `array` file. */
const tree: TreeElement = {
	type: "tree-element",
	key: "root",
	props: {
		name: "shelving",
		children: [
			{
				type: "tree-element",
				key: "util",
				props: { name: "util", children: [{ type: "tree-element", key: "array", props: { name: "array" } }] },
			},
		],
	},
};

describe("TreeRouter", () => {
	// When `APP_URL` has a subfolder, the page threads its site-root-relative path to child cards so hrefs include the subfolder exactly once.
	test("card links include an APP_URL subfolder exactly once", () => {
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/sub/", url: "./util" })}>
				<TreeProvider tree={tree}>
					<TreeRouter />
				</TreeProvider>
			</MetaContext>,
		);
		expect(html).toContain('href="http://x.com/sub/util/array"');
		expect(html).not.toContain("/sub/sub/");
	});

	test("root page card links include an APP_URL subfolder exactly once", () => {
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/sub/", url: "./" })}>
				<TreeProvider tree={tree}>
					<TreeRouter />
				</TreeProvider>
			</MetaContext>,
		);
		expect(html).toContain('href="http://x.com/sub/util"');
		expect(html).not.toContain("/sub/sub/");
	});
});
