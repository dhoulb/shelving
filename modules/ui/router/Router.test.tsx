import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MetaContext } from "../misc/MetaContext.js";
import { createMeta } from "../util/meta.js";
import { Router } from "./Router.js";

const ROUTES = {
	"/": () => <main>Home</main>,
	"/about": () => <main>About</main>,
} as const;

function render(url: string, cache?: number) {
	return renderToStaticMarkup(
		<MetaContext value={createMeta({ root: "http://x.com/", url })}>
			<Router routes={ROUTES} cache={cache} />
		</MetaContext>,
	);
}

describe("Router", () => {
	test("renders the matched route (default cache)", () => {
		expect(render("./about")).toContain("About");
	});

	test("renders the matched route with caching disabled", () => {
		expect(render("./about", 0)).toContain("About");
	});

	test("throws when no route matches and no fallback is given", () => {
		expect(() => render("./missing")).toThrow();
	});
});
