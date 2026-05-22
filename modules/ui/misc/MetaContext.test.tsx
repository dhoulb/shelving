import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMeta } from "../util/meta.js";
import { getMetaPath, MetaContext } from "./MetaContext.js";

/** Render `getMetaPath()` from inside a component so its `use(MetaContext)` call is valid. */
function Probe(): ReactNode {
	return getMetaPath() ?? "none";
}

describe("getMetaPath", () => {
	test("returns the page path relative to the site root", () => {
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/sub/", url: "./util/array" })}>
				<Probe />
			</MetaContext>,
		);
		expect(html).toBe("/util/array");
	});

	test("returns `/` when url and root resolve to the same location", () => {
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/sub/", url: "./" })}>
				<Probe />
			</MetaContext>,
		);
		expect(html).toBe("/");
	});

	test("returns undefined when url or root is unset", () => {
		expect(renderToStaticMarkup(<Probe />)).toBe("none");
	});

	test("returns undefined when url and root are on different origins", () => {
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/", url: "http://y.com/foo" })}>
				<Probe />
			</MetaContext>,
		);
		expect(html).toBe("none");
	});
});
