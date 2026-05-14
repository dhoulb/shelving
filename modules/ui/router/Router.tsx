import type { ReactElement } from "react";
import { UnexpectedError } from "../../error/UnexpectedError.js";
import type { AbsolutePath } from "../../util/path.js";
import { matchPathTemplate, renderPathTemplate } from "../../util/template.js";
import { getURIParams } from "../../util/uri.js";
import { type ImmutableURL, matchURLPrefix } from "../../util/url.js";
import { requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/meta.js";
import type { Routes } from "./Routes.js";

export interface RouterProps extends PossibleMeta {
	readonly routes: Routes;
}

/**
 * Match the current URL against `routes` and render the matched element.
 * - Reads `url` and `base` from the surrounding `<Meta>` context (override via props).
 * - When `base` is set, the effective path is the URL after stripping the base prefix.
 * - Nest by putting another `<Router>` inside a route's value; pass `base="/section"` (or wrap in `<Meta>`) to scope.
 * - Route `{placeholders}` are passed as props to function/component route values along with merged URL `?query` params. They are not published into context — descendants of a `ReactElement`-valued route can't see them automatically.
 * - Returns `null` when there's no URL in context or the URL is outside the base.
 */
export function Router({ routes, ...meta }: RouterProps): ReactElement | null {
	const { url, base } = requireMeta(meta);
	if (!url) return null;
	const path = base ? matchURLPrefix(url, base) : url.pathname;
	if (!path) return null;
	return _matchRoute(routes, path, url);
}

function _matchRoute(routes: Routes, path: AbsolutePath, url: ImmutableURL, depth = 0): ReactElement | null {
	for (const [route, Route] of Object.entries(routes)) {
		const placeholders = matchPathTemplate(route as AbsolutePath, path);
		if (!placeholders) continue;

		// Skip falsy. Allows a route to be conditionally disabled by setting its value to `null` or `false`.
		if (!Route) continue;

		// String value is a redirect; re-run matching with the new path. Guard against infinite redirect loops by limiting depth.
		if (typeof Route === "string") {
			if (depth > 10) throw new UnexpectedError("Infinite redirect loop", { received: route, expected: path, caller: _matchRoute });
			return _matchRoute(routes, renderPathTemplate(Route, placeholders), url, depth + 1);
		}

		// React element — render as-is.
		if (typeof Route !== "function") return Route;

		// Function / component — render with merged URL query params and route placeholders as props (placeholders win on conflict).
		return <Route {...getURIParams(url)} {...placeholders} />;
	}
	return null;
}
