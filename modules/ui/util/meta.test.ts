import { describe, expect, test } from "bun:test";
import { createMeta, mergeMeta, mergeMetaAssets, mergeMetaLinks } from "shelving/ui";
import { requireURL } from "shelving/util/url";

const ROOT = requireURL("http://x.com/app/");
const URL = requireURL("http://x.com/app/sub/page");

describe("mergeMetaLinks", () => {
	test("returns resolved entries when current is unset", () => {
		const links = mergeMetaLinks(undefined, { icon: "/img/favicon.png" }, ROOT, ROOT);
		expect(links?.icon?.href).toBe("http://x.com/app/img/favicon.png");
	});

	test("merges next over current — new keys override, untouched keys survive", () => {
		const current = mergeMetaLinks(undefined, { icon: "/old.png", canonical: "/page" }, ROOT, ROOT);
		const links = mergeMetaLinks(current, { icon: "/new.png" }, ROOT, ROOT);
		expect(links?.icon?.href).toBe("http://x.com/app/new.png");
		expect(links?.canonical?.href).toBe("http://x.com/app/page");
	});

	test("skips nullish link values", () => {
		const links = mergeMetaLinks(undefined, { icon: undefined, canonical: null }, ROOT, ROOT);
		expect(links).toEqual({});
	});

	test("resolves relative hrefs against url and absolute hrefs against root", () => {
		const links = mergeMetaLinks(undefined, { canonical: "./other", icon: "/favicon.png" }, URL, ROOT);
		expect(links?.canonical?.href).toBe("http://x.com/app/sub/page/other");
		expect(links?.icon?.href).toBe("http://x.com/app/favicon.png");
	});

	test("returns current unchanged when next is unset", () => {
		const current = mergeMetaLinks(undefined, { icon: "/favicon.png" }, ROOT, ROOT);
		expect(mergeMetaLinks(current, undefined, ROOT, ROOT)).toBe(current);
	});
});

describe("mergeMetaAssets", () => {
	test("resolves relative hrefs against url and absolute hrefs against root", () => {
		const assets = mergeMetaAssets(undefined, ["./style.css", "/base.css"], URL, ROOT);
		expect(assets?.map(({ href }) => href)).toEqual(["http://x.com/app/sub/page/style.css", "http://x.com/app/base.css"]);
	});

	test("appends next after current and skips nullish values", () => {
		const current = mergeMetaAssets(undefined, ["/base.css"], ROOT, ROOT);
		const assets = mergeMetaAssets(current, [undefined, "/extra.css", null], ROOT, ROOT);
		expect(assets?.map(({ href }) => href)).toEqual(["http://x.com/app/base.css", "http://x.com/app/extra.css"]);
	});
});

describe("mergeMeta", () => {
	test("meta with links set produces non-empty resolved links", () => {
		const meta = createMeta({ root: "http://x.com/", url: "./", links: { icon: "/img/favicon.png" } });
		expect(meta.links?.icon?.href).toBe("http://x.com/img/favicon.png");
	});

	test("merges new links over existing resolved links", () => {
		const meta1 = createMeta({ root: "http://x.com/", url: "./", links: { icon: "/favicon.png" } });
		const meta2 = mergeMeta(meta1, { url: "./page", links: { canonical: "/page" } });
		expect(meta2.links?.icon?.href).toBe("http://x.com/favicon.png");
		expect(meta2.links?.canonical?.href).toBe("http://x.com/page");
	});
});
