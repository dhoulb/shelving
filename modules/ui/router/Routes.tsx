import type { ComponentClass, FunctionComponent, ReactElement } from "react";
import type { Nullish } from "../../util/null.js";
import type { AbsolutePath } from "../../util/path.js";
import type { URIParams } from "../../util/uri.js";

/**
 * Props for a component that works as a route in the router.
 * - Combines `?query` params from the URL and `{placeholder}` matches from the route template into one flat string dictionary.
 * - Template placeholder values take precedence over query params with the same name.
 *
 * @see https://shelving.cc/ui/RouteProps
 */
export type RouteProps = URIParams;

/**
 * React component usable as a route value — a function or class component accepting `RouteProps`.
 *
 * @see https://shelving.cc/ui/RouteComponent
 */
export type RouteComponent = FunctionComponent<RouteProps> | ComponentClass<RouteProps>;

/**
 * Valid route values:
 * - `RouteComponent` — rendered as `<Component {...params}/>` with merged placeholder + query params.
 * - `AbsolutePath` string — triggers a redirect to that path.
 * - `ReactElement` — rendered as-is (use for layout-wrapping a nested `<Router>` inside).
 *
 * @see https://shelving.cc/ui/Route
 */
export type Route = RouteComponent | AbsolutePath | ReactElement;

/**
 * Route table mapping `{ path: RouteComponent | redirectPath | ReactElement }` for a `<Router>`.
 *
 * - Each key is a path starting with `/`, optionally containing `{named}` placeholders passed into the component.
 * - Each value is a `Route` (or a nullish/`false` value to disable that route).
 *
 * @see https://shelving.cc/ui/Routes
 */
export type Routes = {
	[key: AbsolutePath]: Nullish<Route | false>;
};
