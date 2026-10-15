import { type ReactNode, use } from "react";
import type { AbsolutePath } from "../../util/path.js";
import { RouteContext } from "./RouteContext.js";

/**
 * Props for `<RoutePath>` — the path template the page owns, and the page content.
 *
 * @see https://shelving.cc/ui/RoutePathProps
 */
export interface RoutePathProps {
	/** Path template the page owns, for example `/dave/{tab}`. Every path that matches it shows this same page. */
	readonly path: AbsolutePath;
	/** The page content. */
	readonly children?: ReactNode;
}

/**
 * Tell the surrounding `<Router>` (and `<RouteCache>`) that this page owns every path that matches a template.
 * - A navigation to a path the page owns keeps the same page mounted, so it keeps its scroll and state,
 *   and a `<ViewTransition>` around the page does not run an enter or exit. The page updates for the new URL.
 * - Use it for a page whose tabs each have their own path: `<RoutePath path="/dave/{tab}">`.
 * - Put the real values in the template. `/{name}/{tab}` would make every person's profile one page.
 *
 * @kind component
 * @see https://shelving.cc/ui/RoutePath
 */
export function RoutePath({ path, children }: RoutePathProps): ReactNode {
	const state = use(RouteContext);
	if (state) {
		state.path = path;
		if (state.cache) state.cache.path = path;
	}
	return children;
}
