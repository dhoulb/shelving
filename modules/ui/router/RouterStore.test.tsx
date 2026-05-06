import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import type { AbsolutePath } from "../../util/path.js";
import { matchRoute, type RouteProps, type Routes } from "../index.js";

function PropsPage(_props: RouteProps): ReactElement {
	return <main />;
}

function NoPropsPage(): ReactElement {
	return <main />;
}

describe("matchRoute", () => {
	test("passes query params and route placeholders to page props", () => {
		const routes: Routes = {
			"/enquiry/{form}": PropsPage,
		};

		const element = matchRoute(routes, "/enquiry/loan", { gclid: "abc123", form: "query-form" });

		expect(element?.props).toEqual({ gclid: "abc123", form: "loan" });
	});

	test("carries query params through redirects", () => {
		const routes: Routes = {
			"/old/{form}": "/enquiry/{form}" as AbsolutePath,
			"/enquiry/{form}": PropsPage,
		};

		const element = matchRoute(routes, "/old/loan", { gclid: "abc123" });

		expect(element?.props).toEqual({ gclid: "abc123", form: "loan" });
	});

	test("allows page components without props", () => {
		const routes: Routes = {
			"/test": NoPropsPage,
		};

		expect(matchRoute(routes, "/test", {})).not.toBeNull();
	});
});
