import { expect, test } from "bun:test";
import { HTMLPage } from "../ui/page/Page.js";
import { renderRoute, renderRoutes } from "./index.js";

test("renderRoute() prepends <!DOCTYPE html> when output starts with <html", () => {
	const html = renderRoute(<HTMLPage title="Hello">body</HTMLPage>, "http://localhost/foo");
	expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
	expect(html).toContain("<html");
	expect(html).toContain('<body id="root">');
	expect(html).toContain("<title>Hello</title>");
});

test("renderRoute() does not prepend doctype for non-document fragments", () => {
	const html = renderRoute(<div>hello</div>, "http://localhost/foo");
	expect(html.startsWith("<!DOCTYPE")).toBe(false);
	expect(html).toBe("<div>hello</div>");
});

test("renderRoutes() returns an entry per URL keyed by stringified URL", () => {
	const urls = ["http://localhost/", "http://localhost/a/b", new URL("/c", "http://localhost/")];
	const out = renderRoutes(<div>x</div>, urls);
	expect(Object.keys(out)).toEqual(["http://localhost/", "http://localhost/a/b", "http://localhost/c"]);
	for (const v of Object.values(out)) expect(v).toBe("<div>x</div>");
});
