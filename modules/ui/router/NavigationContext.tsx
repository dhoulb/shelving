import { createContext } from "react";
import { requireContext } from "../util/context.js";
import type { NavigationSequence } from "./NavigationSequence.js";

/**
 * React context holding the current `NavigationSequence`, provided by `<Navigation>`.
 *
 * @example <NavigationContext value={nav}>…</NavigationContext>
 * @see https://shelving.cc/ui/NavigationContext
 */
export const NavigationContext = createContext<NavigationSequence | undefined>(undefined);
NavigationContext.displayName = "NavigationContext";

/**
 * Read the current `NavigationSequence` from context, throwing if used outside `<Navigation>`.
 *
 * @returns The current `NavigationSequence`.
 * @throws RequiredError If no `<Navigation>` provider is present above.
 * @see https://shelving.cc/ui/requireNavigation
 */
export function requireNavigation(): NavigationSequence {
	return requireContext(NavigationContext, requireNavigation);
}
