import type { ReactElement } from "react";
import { requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/meta.js";
import { matchRoute, type Routes } from "./Routes.js";

export interface RouterProps extends PossibleMeta {
	readonly routes: Routes;
}

/**
 * Match the current URL against `routes` and render the matched element.
 * - Pure matcher: reads `url` and `base` from the surrounding `<Meta>` context (override via props).
 * - When `base` is set, the effective path passed to `matchRoute` is the URL after stripping the base prefix.
 * - Nest by putting another `<Router>` inside a route's value; pass `base="/section"` (or wrap in `<Meta>`) to scope.
 * - Route placeholders are published as URL params so descendants can read them via `requireMetaParams()`.
 * - Returns `null` when there's no URL in context or the URL is outside the base.
 */
export function Router({ routes, ...meta }: RouterProps): ReactElement | null {
	const merged = requireMeta(meta);
	return matchRoute(routes, merged);
}
