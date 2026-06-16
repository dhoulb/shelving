import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MetaContext } from "../misc/MetaContext.js";
import { createMeta } from "../util/meta.js";
import { Router } from "./Router.js";

const ROUTES = {
	"/": () => <main>Home</main>,
	"/about": () => <main>About</main>,
} as const;

function render(url: string) {
	return renderToStaticMarkup(
		<MetaContext value={createMeta({ root: "http://x.com/", url })}>
			<Router routes={ROUTES} />
		</MetaContext>,
	);
}

describe("Router", () => {
	test("renders the matched route", () => {
		expect(render("./about")).toContain("About");
	});

	test("throws when no route matches and no fallback is given", () => {
		expect(() => render("./missing")).toThrow();
	});
});
