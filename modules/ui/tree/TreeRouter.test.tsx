import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { TreeElement } from "../../util/element.js";
import { MetaContext } from "../misc/MetaContext.js";
import { createMeta } from "../util/meta.js";
import { TreeRouter } from "./TreeRouter.js";

/** Minimal tree: root → `util` directory → `array` file. */
const tree: TreeElement = {
	type: "tree-directory",
	key: "root",
	props: {
		name: "shelving",
		children: [
			{
				type: "tree-directory",
				key: "util",
				props: { name: "util", children: [{ type: "tree-file", key: "array", props: { name: "array" } }] },
			},
		],
	},
};

describe("TreeRouter", () => {
	// When `APP_URL` has a subfolder, the page threads its site-root-relative path to child cards so hrefs include the subfolder exactly once.
	test("card links include an APP_URL subfolder exactly once", () => {
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/sub/", url: "./util" })}>
				<TreeRouter path="/util" tree={tree} />
			</MetaContext>,
		);
		expect(html).toContain('href="http://x.com/sub/util/array"');
		expect(html).not.toContain("/sub/sub/");
	});

	test("root page card links include an APP_URL subfolder exactly once", () => {
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/sub/", url: "./" })}>
				<TreeRouter path="/" tree={tree} />
			</MetaContext>,
		);
		expect(html).toContain('href="http://x.com/sub/util"');
		expect(html).not.toContain("/sub/sub/");
	});
});
