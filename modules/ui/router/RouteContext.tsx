import { createContext } from "react";
import type { AbsolutePath } from "../../util/path.js";

/**
 * The route state of one page, shared by `<Router>`, `<RouteCache>` and `<RoutePath>`.
 * - `path` is the template of the paths the page owns, set by `<RoutePath>`.
 * - `cache` is the page's `<RouteCache>` entry, so `<RoutePath>` in a top-level page also tells the cache.
 * - `router` marks a state made by `<Router>`, so a nested router does not pass the cache entry on.
 *
 * @see https://shelving.cc/ui/RouteState
 */
export interface RouteState {
	path?: AbsolutePath | undefined;
	readonly cache?: RouteState | undefined;
	readonly router?: true | undefined;
}

/**
 * React context holding the `RouteState` of the current page, provided by `<Router>` and `<RouteCache>`.
 *
 * @see https://shelving.cc/ui/RouteContext
 */
export const RouteContext = createContext<RouteState | undefined>(undefined);
RouteContext.displayName = "RouteContext";
