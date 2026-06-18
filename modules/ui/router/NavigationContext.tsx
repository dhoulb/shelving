import { createContext } from "react";
import { requireContext } from "../util/context.js";
import type { NavigationStore } from "./NavigationStore.js";

/**
 * React context holding the current [`NavigationStore`](/ui/NavigationStore), provided by [`<Navigation>`](/ui/Navigation).
 *
 * @example <NavigationContext value={store}>…</NavigationContext>
 * @see https://dhoulb.github.io/shelving/ui/router/NavigationContext/NavigationContext
 */
export const NavigationContext = createContext<NavigationStore | undefined>(undefined);
NavigationContext.displayName = "NavigationContext";

/**
 * Read the current [`NavigationStore`](/ui/NavigationStore) from context, throwing if used outside [`<Navigation>`](/ui/Navigation).
 *
 * @returns The current `NavigationStore`.
 * @throws RequiredError If no `<Navigation>` provider is present above.
 * @example const nav = requireNavigation(); nav.forward("/home");
 * @see https://dhoulb.github.io/shelving/ui/router/NavigationContext/requireNavigation
 */
export function requireNavigation(): NavigationStore {
	return requireContext(NavigationContext, requireNavigation);
}
