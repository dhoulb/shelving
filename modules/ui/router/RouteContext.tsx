import { createContext } from "react";
import type { AbsolutePath } from "../../util/path.js";

/**
 * The route state of one page, shared by `<Router>`, `<RouteCache>` and `<RouteConfig>`.
 * - `path` is the template of the paths the page owns, set by `<RouteConfig path>`.
 * - `cache` is `false` when `<RouteCache>` drops the page as you leave it, set by `<RouteConfig cache>`.
 * - `entry` is the page's `<RouteCache>` entry, so `<RouteConfig>` in a top-level page also tells the cache.
 * - `router` marks a state made by `<Router>`, so a nested router does not pass the cache entry on.
 *
 * @see https://shelving.cc/ui/RouteState
 */
export interface RouteState {
	path?: AbsolutePath | undefined;
	cache?: boolean | undefined;
	readonly entry?: RouteState | undefined;
	readonly router?: true | undefined;
}

/**
 * React context holding the `RouteState` of the current page, provided by `<Router>` and `<RouteCache>`.
 *
 * @see https://shelving.cc/ui/RouteContext
 */
export const RouteContext = createContext<RouteState | undefined>(undefined);
RouteContext.displayName = "RouteContext";
