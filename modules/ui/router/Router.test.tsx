import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createMeta, MetaContext, type RouteProps, Router } from "shelving/ui";

const ROUTES = {
	"/": () => <main>Home</main>,
	"/about": () => <main>About</main>,
	"/enquiry/{form}": ({ form }: RouteProps) => <main>Enquiry {form}</main>,
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

	test("matches a route when the url has a trailing slash", () => {
		// A trailing slash on the url resolves to the same route as the slash-less form.
		expect(render("http://x.com/about/")).toContain("About");
		expect(render("http://x.com/enquiry/loan")).toContain("Enquiry loan");
		expect(render("http://x.com/enquiry/loan/")).toContain("Enquiry loan");
	});
});
