import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Navigation, requireMetaURL } from "shelving/ui";

/** Render `requireMetaURL().path` from inside a component so its `use(MetaContext)` call is valid. */
function Probe(): ReactNode {
	return requireMetaURL().path;
}

describe("Navigation", () => {
	test("publishes merged meta with a root derived from the url", () => {
		const html = renderToStaticMarkup(
			<Navigation url="http://x.com/a/b">
				<Probe />
			</Navigation>,
		);
		expect(html).toBe("/a/b");
	});

	test("resolves a relative url against an explicit root", () => {
		const html = renderToStaticMarkup(
			<Navigation root="http://x.com/app/" url="./sub">
				<Probe />
			</Navigation>,
		);
		expect(html).toBe("/sub");
	});
});
