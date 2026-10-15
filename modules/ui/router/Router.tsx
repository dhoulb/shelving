import { type ReactElement, use, useRef } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { UnexpectedError } from "../../error/UnexpectedError.js";
import { getProps } from "../../util/index.js";
import { matchPathTemplate, renderPathTemplate } from "../../util/template.js";
import { MetaContext, type MetaURL, requireMetaURL } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/meta.js";
import { RouteContext, type RouteState } from "./RouteContext.js";
import type { Routes } from "./Routes.js";

/**
 * Props for `<Router>` — the `routes` to match against plus an optional `fallback`.
 *
 * @see https://shelving.cc/ui/RouterProps
 */
export interface RouterProps extends PossibleMeta {
	/** List of routes for the router to match against. */
	readonly routes: Routes;

	/**
	 * Optional fallback element.
	 * - Explicit `null` means fallback to nothing (router will not throw `NotFoundError`).
	 */
	readonly fallback?: ReactElement | undefined | null;
}

/**
 * Match the current URL against `routes` and render the matched element.
 * - Reads `url` and `base` from the surrounding `<Meta>` context (override via props).
 * - When `base` is set, the effective path is the URL after stripping the base prefix.
 * - Nest by putting another `<Router>` inside a route's value; pass `base="/section"` (or wrap in `<Meta>`) to scope.
 * - Route `{placeholders}` are passed as props to function/component route values along with merged URL `?query` params. They are not published into context — descendants of a `ReactElement`-valued route can't see them automatically.
 * - Each path is a new page, so a component route remounts when the path changes. A page that owns other paths with `<RoutePath>` stays mounted when the path changes to one of them.
 * - Returns `null` when there's no URL in context or the URL is outside the base.
 *
 * @kind component
 * @throws NotFoundError If no route matches and `fallback` is `undefined`.
 * @see https://shelving.cc/ui/Router
 */
export function Router({ routes, fallback, ...meta }: RouterProps): ReactElement | null {
	const combined = requireMetaURL(meta);
	const path = combined;

	// Keep the current page when it owns the new path with `<RoutePath>`, else start a new page for this path.
	// The top-level router passes the `<RouteCache>` entry on, so `<RoutePath>` in its page also tells the cache.
	const parent = use(RouteContext);
	const pageRef = useRef<{ key: string; state: RouteState }>(undefined);
	const prev = pageRef.current;
	const page =
		prev && (prev.key === combined.path || (prev.state.path && matchPathTemplate(prev.state.path, combined.path)))
			? prev
			: { key: combined.path, state: { router: true, cache: parent?.router ? undefined : parent } as RouteState };
	pageRef.current = page;

	const route = _matchRoute(routes, fallback, combined, page.key);
	if (route)
		return (
			<RouteContext value={page.state}>
				<MetaContext value={combined}>{route}</MetaContext>
			</RouteContext>
		);
	throw new NotFoundError("Tree route not found", { received: path });
}

function _matchRoute(
	routes: Routes,
	fallback: ReactElement | null | undefined,
	meta: MetaURL,
	key: string,
	path = meta.path,
	depth = 0,
): ReactElement | null | undefined {
	for (const [route, Route] of getProps(routes)) {
		// Try to match this path.
		const placeholders = matchPathTemplate(route, path);
		if (!placeholders) continue;

		// Skip falsy. Allows a route to be conditionally disabled by setting its value to `null` or `false`.
		if (!Route) continue;

		// String value is a redirect; re-run matching with the new path. Guard against infinite redirect loops by limiting depth.
		if (typeof Route === "string") {
			if (depth > 10) throw new UnexpectedError("Infinite redirect loop", { received: route, expected: path, caller: _matchRoute });
			// `placeholders` are already decoded by `matchPathTemplate`, so re-encode them into the redirect path with `renderPathTemplate` — the symmetric partner of the match above.
			return _matchRoute(routes, fallback, meta, key, renderPathTemplate(Route, placeholders), depth + 1);
		}

		// React element — render as-is.
		if (typeof Route !== "function") return Route;

		// Component — render with merged URL query params and route placeholders as props (placeholders win on conflict).
		return <Route key={key} {...meta.params} {...placeholders} />;
	}

	// No match, try the fallback.
	if (fallback !== undefined) return fallback;

	// Fallback is undefined, throw a `NotFoundError`
	throw new NotFoundError("No matching route found", { received: path, caller: _matchRoute });
}
