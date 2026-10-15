import { createContext, type ReactNode, use } from "react";
import type { AbsolutePath } from "../../util/path.js";

/** The paths a page cached by `<RouteCache>` owns, set by a `<RoutePath>` inside it. */
export interface RoutePathOwner {
	path?: AbsolutePath | undefined;
}

/**
 * React context holding the `RoutePathOwner` of the cached page, provided by `<RouteCache>`.
 *
 * @see https://shelving.cc/ui/RoutePathContext
 */
export const RoutePathContext = createContext<RoutePathOwner | undefined>(undefined);
RoutePathContext.displayName = "RoutePathContext";

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
 * Tell the surrounding `<RouteCache>` that this page owns every path that matches a template.
 * - A navigation to a path the page owns keeps the same page mounted, so it keeps its scroll and state,
 *   and a `<ViewTransition>` around the page does not run an enter or exit. The page updates for the new URL.
 * - Use it for a page whose tabs each have their own path: `<RoutePath path="/dave/{tab}">`.
 * - Put the real values in the template. `/{name}/{tab}` would make every person's profile one page.
 * - Does nothing outside a `<RouteCache>`.
 *
 * @kind component
 * @see https://shelving.cc/ui/RoutePath
 */
export function RoutePath({ path, children }: RoutePathProps): ReactNode {
	const owner = use(RoutePathContext);
	if (owner) owner.path = path;
	return children;
}
