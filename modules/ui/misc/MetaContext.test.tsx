import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RequiredError } from "../../error/RequiredError.js";
import { createMeta } from "../util/meta.js";
import { MetaContext, requireMetaURL } from "./MetaContext.js";

/** Render `requireMetaURL().path` from inside a component so its `use(MetaContext)` call is valid. */
function Probe(): ReactNode {
	return requireMetaURL().path;
}

describe("requireMetaURL", () => {
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

	test("throws RequiredError when url is unset", () => {
		expect(() => renderToStaticMarkup(<Probe />)).toThrow(RequiredError);
	});

	test("throws RequiredError when url and root are on different origins", () => {
		expect(() =>
			renderToStaticMarkup(
				<MetaContext value={createMeta({ root: "http://x.com/", url: "http://y.com/foo" })}>
					<Probe />
				</MetaContext>,
			),
		).toThrow(RequiredError);
	});
});
