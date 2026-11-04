import { type ReactNode, use } from "react";
import type { AbsolutePath } from "../../util/path.js";
import { RouteContext, type RouteState } from "./RouteContext.js";

/**
 * Props for `<RouteConfig>` — the settings of a page for the surrounding `<Router>` and `<RouteCache>`, and the page content.
 *
 * @see https://shelving.cc/ui/RouteConfigProps
 */
export interface RouteConfigProps {
	/** Path template the page owns, for example `/dave/{tab}`. Every path that matches it shows this same page. */
	readonly path?: AbsolutePath | undefined;
	/** Set to `false` so `<RouteCache>` drops the page when you leave it, and the next visit shows a new page. Defaults to `true`. */
	readonly cache?: boolean | undefined;
	/** The page content. */
	readonly children?: ReactNode;
}

/**
 * Configure the current page for the surrounding `<Router>` (and `<RouteCache>`).
 * - `path` says the page owns every path that matches a template. A navigation to a path the page owns keeps the same
 *   page mounted, so it keeps its scroll and state, and a `<ViewTransition>` around the page does not run an enter or
 *   exit. The page updates for the new URL. Use it for a page whose tabs each have their own path: `path="/dave/{tab}"`.
 * - Put the real values in the template. `/{name}/{tab}` would make every person's profile one page.
 * - `cache={false}` makes `<RouteCache>` drop the page when you leave it, so the next visit starts again with no old
 *   state. Use it for a form that makes or edits something, for example a "New challenge" page.
 *
 * @kind component
 * @see https://shelving.cc/ui/RouteConfig
 */
export function RouteConfig({ path, cache, children }: RouteConfigProps): ReactNode {
	const state = use(RouteContext);
	if (state) {
		_configure(state, path, cache);
		if (state.entry) _configure(state.entry, path, cache);
	}
	return children;
}

/** Set the given settings on a page's route state. */
function _configure(state: RouteState, path: AbsolutePath | undefined, cache: boolean | undefined): void {
	if (path !== undefined) state.path = path;
	if (cache !== undefined) state.cache = cache;
}
