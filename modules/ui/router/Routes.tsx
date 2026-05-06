import type { ComponentClass, FunctionComponent, ReactElement } from "react";
import { UnexpectedError } from "../../error/UnexpectedError.js";
import type { Nullish } from "../../util/null.js";
import type { AbsolutePath } from "../../util/path.js";
import { matchTemplate, renderTemplate } from "../../util/template.js";
import type { URIParams } from "../../util/uri.js";

/**
 * Props for a component that works as a route in the router.
 * - Combines `?query` params from the URL and `{placeholder}` matches from the route template into one flat string dictionary.
 * - Template placeholder values take precedence over query params with the same name.
 */
export type RouteProps = URIParams;

/** React component that allows `RouteProps` (either a function component or a class component). */
export type RouteComponent = FunctionComponent<RouteProps> | ComponentClass<RouteProps>;

/** Valid routes are either a route component, or an absolute path string to trigger a redirect instead. */
export type Route = RouteComponent | AbsolutePath;

/**
 * List of routes in `{ path: PageComponent | "redirect" }` format.
 *
 * @param path String path starting with `/` slash, possibly containing `{named}` placeholders that get passed into the component.
 * @param Component React component (either function or class component) that gets created if this route matches.
 *   - The component must accept `RouteProps` (or no props) so route placeholders and query params can be passed in.
 * @param redirect String path stating with `/` slash that redirects the user to a new page when visited.
 */
export type Routes = {
	[key: AbsolutePath]: Nullish<RouteComponent | AbsolutePath | false>;
};

/**
 * Return the first element in `routes` matching `path`, or a redirect path if applicable.
 *
 * @param routes A list of routes in `{ path: PageComponent | "redirect" }` format.
 * @param path An input path, e.g. `/users/123`
 * @param params URL `?query` params for the current request.
 *   - Merged with `{placeholder}` values from the matched route template and passed to the page as props.
 *   - Placeholder values win on conflict (a template `{id}` overrides a `?id=` param).
 *
 * @return {ReactElement} `path` matched a React element.
 * @return {null} `path` did not match any route.
 */
export function matchRoute(routes: Routes, path: AbsolutePath, params?: URIParams): ReactElement | null {
	return _matchRoute(routes, path, params);
}
export function _matchRoute(routes: Routes, path: AbsolutePath, params?: URIParams, depth = 0): ReactElement | null {
	for (const [route, MatchedPage] of Object.entries(routes)) {
		const placeholders = matchTemplate(route, path);
		if (placeholders) {
			if (!MatchedPage) continue;
			const props: RouteProps = { ...params, ...placeholders };
			if (typeof MatchedPage === "string") {
				if (depth > 10) throw new UnexpectedError("Infinite redirect loop", { received: route, expected: path, caller: matchRoute });
				return _matchRoute(routes, renderTemplate(MatchedPage, placeholders) as AbsolutePath, props, depth + 1);
			}
			return <MatchedPage {...props} />;
		}
	}
	return null;
}
