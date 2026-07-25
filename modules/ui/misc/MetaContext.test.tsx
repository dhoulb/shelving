import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMeta, MetaContext, requireMetaURL } from "shelving/ui";
import { requireURL } from "shelving/util/url";

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

	test("normalizes a trailing slash on the url away", () => {
		// `/enquiry/loan/` resolves to the same path as `/enquiry/loan`, so trailing-slash URLs match the same route.
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ root: "http://x.com/", url: "http://x.com/enquiry/loan/" })}>
				<Probe />
			</MetaContext>,
		);
		expect(html).toBe("/enquiry/loan");
	});

	test("defaults root to the url's origin when root is unset", () => {
		const html = renderToStaticMarkup(
			<MetaContext value={createMeta({ url: "http://x.com/enquiry/loan" })}>
				<Probe />
			</MetaContext>,
		);
		expect(html).toBe("/enquiry/loan");
	});

	test("throws RequiredError when url is unset", () => {
		expect(() => renderToStaticMarkup(<Probe />)).toThrow("Meta URL is required");
	});

	test("throws RequiredError when root is unset and was not derived", () => {
		// Bypass `createMeta()` deliberately — merged meta always derives a root, so this backup check only fires for hand-built meta.
		expect(() =>
			renderToStaticMarkup(
				<MetaContext value={{ url: requireURL("http://x.com/foo") }}>
					<Probe />
				</MetaContext>,
			),
		).toThrow("Meta root is required");
	});

	test("throws RequiredError when url and root are on different origins", () => {
		expect(() =>
			renderToStaticMarkup(
				<MetaContext value={createMeta({ root: "http://x.com/", url: "http://y.com/foo" })}>
					<Probe />
				</MetaContext>,
			),
		).toThrow("Meta URL and meta root must share a root");
	});

	test("throws RequiredError when url is outside the root's path", () => {
		expect(() =>
			renderToStaticMarkup(
				<MetaContext value={createMeta({ root: "http://x.com/app/", url: "http://x.com/other" })}>
					<Probe />
				</MetaContext>,
			),
		).toThrow("Meta URL and meta root must share a root");
	});
});
