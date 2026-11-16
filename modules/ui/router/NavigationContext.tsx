import { createContext } from "react";
import { requireContext } from "../util/context.js";
import type { NavigationPosition, NavigationStore } from "./NavigationStore.js";

/**
 * React context holding the current `NavigationStore`, provided by `<Navigation>`.
 *
 * @example <NavigationContext value={store}>…</NavigationContext>
 * @see https://shelving.cc/ui/NavigationContext
 */
export const NavigationContext = createContext<NavigationStore | undefined>(undefined);
NavigationContext.displayName = "NavigationContext";

/**
 * Read the current `NavigationStore` from context, throwing if used outside `<Navigation>`.
 *
 * @returns The current `NavigationStore`.
 * @throws RequiredError If no `<Navigation>` provider is present above.
 * @see https://shelving.cc/ui/requireNavigation
 */
export function requireNavigation(): NavigationStore {
	return requireContext(NavigationContext, requireNavigation);
}

/**
 * React context holding where the app is in its stacks, published by `<Navigation>` with each URL change.
 * - `undefined` without the browser Navigation API, during a server render, or outside `<Navigation>`.
 * - `<RouteCache>`, `<Router>` and `<BackButton>` read it, so they change in the same render as the URL.
 *
 * @see https://shelving.cc/ui/NavigationPositionContext
 */
export const NavigationPositionContext = createContext<NavigationPosition | undefined>(undefined);
NavigationPositionContext.displayName = "NavigationPositionContext";
