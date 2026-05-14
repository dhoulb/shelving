import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import type { AbsolutePath } from "../../util/path.js";
import { requireURL } from "../../util/url.js";
import { matchRoute, type RouteProps, type Routes } from "../index.js";

function PropsPage(_props: RouteProps): ReactElement {
	return <main />;
}

function NoPropsPage(): ReactElement {
	return <main />;
}

/** Pull the matched component element out of the `MetaContext` wrapper produced by `matchRoute`. */
function unwrap(element: ReactElement | null): ReactElement | null {
	if (!element) return null;
	const children = (element.props as { children?: ReactElement }).children;
	return children ?? null;
}

describe("matchRoute", () => {
	test("passes query params and route placeholders to page props", () => {
		const routes: Routes = {
			"/enquiry/{form}": PropsPage,
		};

		const inner = unwrap(matchRoute(routes, "/enquiry/loan", { url: requireURL("https://x.com/enquiry/loan?gclid=abc123&form=query-form") }));

		expect(inner?.props).toEqual({ gclid: "abc123", form: "loan" });
	});

	test("carries query params through redirects", () => {
		const routes: Routes = {
			"/old/{form}": "/enquiry/{form}" as AbsolutePath,
			"/enquiry/{form}": PropsPage,
		};

		const inner = unwrap(matchRoute(routes, "/old/loan", { url: requireURL("https://x.com/old/loan?gclid=abc123") }));

		expect(inner?.props).toEqual({ gclid: "abc123", form: "loan" });
	});

	test("allows page components without props", () => {
		const routes: Routes = {
			"/test": NoPropsPage,
		};

		expect(matchRoute(routes, "/test", {})).not.toBeNull();
	});
});
