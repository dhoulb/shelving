import { createContext } from "react";
import { requireContext } from "../util/context.js";
import type { NavigationStore } from "./NavigationStore.js";

/** Context that stores the current `NavigationStore`. */
export const NavigationContext = createContext<NavigationStore | undefined>(undefined);
NavigationContext.displayName = "NavigationContext";

/** Require the current navigation store in a component. */
export function requireNavigation(): NavigationStore {
	return requireContext(NavigationContext, requireNavigation);
}
