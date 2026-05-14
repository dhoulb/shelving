import type { ComponentClass, FunctionComponent, ReactElement } from "react";
import type { Nullish } from "../../util/null.js";
import type { AbsolutePath } from "../../util/path.js";
import type { URIParams } from "../../util/uri.js";

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
