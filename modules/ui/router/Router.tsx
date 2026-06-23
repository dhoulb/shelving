import type { ReactElement } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { UnexpectedError } from "../../error/UnexpectedError.js";
import { getProps } from "../../util/index.js";
import { matchPathTemplate, renderPathTemplate } from "../../util/template.js";
import { MetaContext, type MetaURL, requireMetaURL } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/meta.js";
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
 * - Returns `null` when there's no URL in context or the URL is outside the base.
 *
 * @kind component
 * @param routes The route table to match the current URL against.
 * @param fallback Element to render when nothing matches; explicit `null` renders nothing instead of throwing.
 * @param meta Optional meta (url/base) overrides for this router scope.
 * @returns The matched route element, or `null`/`fallback` when nothing matches.
 * @throws NotFoundError If no route matches and `fallback` is `undefined`.
 * @example <Router routes={{ "/": HomePage, "/about": AboutPage }} />
 * @see https://shelving.cc/ui/Router
 */
export function Router({ routes, fallback, ...meta }: RouterProps): ReactElement | null {
	const combined = requireMetaURL(meta);
	const path = combined;
	const route = _matchRoute(routes, fallback, combined);
	if (route) return <MetaContext value={combined}>{route}</MetaContext>;
	throw new NotFoundError("Tree route not found", { received: path });
}

function _matchRoute(
	routes: Routes,
	fallback: ReactElement | null | undefined,
	meta: MetaURL,
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
			return _matchRoute(routes, fallback, meta, renderPathTemplate(Route, placeholders), depth + 1);
		}

		// React element — render as-is.
		if (typeof Route !== "function") return Route;

		// Component — render with merged URL query params and route placeholders as props (placeholders win on conflict).
		return <Route key={path} {...meta.params} {...placeholders} />;
	}

	// No match, try the fallback.
	if (fallback !== undefined) return fallback;

	// Fallback is undefined, throw a `NotFoundError`
	throw new NotFoundError("No matching route found", { received: path, caller: _matchRoute });
}
