import type { ComponentClass, FunctionComponent, ReactElement } from "react";
import { UnexpectedError } from "../../error/UnexpectedError.js";
import { type ImmutableURL, matchURLPrefix } from "../../util/index.js";
import type { Nullish } from "../../util/null.js";
import type { AbsolutePath } from "../../util/path.js";
import { matchPathTemplate, renderPathTemplate } from "../../util/template.js";
import { getURIParams, type URIParams, withURIParams } from "../../util/uri.js";
import { MetaContext } from "../misc/MetaContext.js";
import type { Meta } from "../util/meta.js";

/**
 * Props for a component that works as a route in the router.
 * - Combines `?query` params from the URL and `{placeholder}` matches from the route template into one flat string dictionary.
 * - Template placeholder values take precedence over query params with the same name.
 */
export type RouteProps = URIParams;

/** React component that allows `RouteProps` (either a function component or a class component). */
export type RouteComponent = FunctionComponent<RouteProps> | ComponentClass<RouteProps>;

/**
 * Valid route values:
 * - `RouteComponent` — rendered as `<Component {...params}/>` with merged placeholder + query params.
 * - `AbsolutePath` string — triggers a redirect to that path.
 * - `ReactElement` — rendered as-is (use for layout-wrapping a nested `<Router>` inside).
 */
export type Route = RouteComponent | AbsolutePath | ReactElement;

/**
 * List of routes in `{ path: RouteComponent | redirectPath | ReactElement }` format.
 *
 * @param path String path starting with `/` slash, possibly containing `{named}` placeholders that get passed into the component.
 * @param value Route value — see `Route`.
 */
export type Routes = {
	[key: AbsolutePath]: Nullish<Route | false>;
};

/**
 * Return the first element in `routes` matching `path`, wrapped in a `MetaContext` that publishes placeholders as URL params.
 * - Placeholder values from the matched template are merged into the surrounding URL's search params, so descendants can read them via `requireMetaParams()`.
 * - Component/function route values also receive the merged params directly as props (placeholder values override query params on conflict).
 * - Returns `null` when no route matches.
 *
 * @param routes A list of routes in `{ path: value }` format.
 * @param path The path to match against, e.g. `/users/123`.
 * @param meta Current meta from context (`url` is updated with placeholders before wrapping).
 */
export function matchRoute(routes: Routes, meta: Meta): ReactElement | null {
	const { url, base } = meta;
	if (!url) return null;
	const path = base ? matchURLPrefix(url, base) : url.pathname;
	if (!path) return null;
	return _matchRoute(routes, path, url, meta);
}
function _matchRoute(routes: Routes, path: AbsolutePath, url: ImmutableURL, meta: Meta, depth = 0): ReactElement | null {
	for (const [route, Route] of Object.entries(routes)) {
		const placeholders = matchPathTemplate(route as AbsolutePath, path);
		if (placeholders) {
			// Skip falsy. This allows a route to be conditionally disabled by setting its value to `null` or `false`.
			if (!Route) continue;

			// String value is a redirect; re-run matching with the new path. Guard against infinite redirect loops by limiting depth.
			if (typeof Route === "string") {
				if (depth > 10) throw new UnexpectedError("Infinite redirect loop", { received: route, expected: path, caller: matchRoute });
				return _matchRoute(routes, renderPathTemplate(Route, placeholders), url, meta, depth + 1);
			}

			// Either a React element or a component.
			// Render the route with `{placeholders}` merged into the URL search params and passed as props.
			const params: URIParams = { ...getURIParams(url), ...placeholders };
			return (
				<MetaContext value={{ ...meta, url: withURIParams(url, placeholders) }}>
					{typeof Route === "function" ? <Route {...params} /> : Route}
				</MetaContext>
			);
		}
	}
	return null;
}
