import { createContext } from "react";
import { requireContext } from "../util/context.js";
import type { RouterStore } from "./RouterStore.js";

/** Context that stores the current `RouterStore` */
export const RouterContext = createContext<RouterStore | undefined>(undefined);
RouterContext.displayName = "RouterContext";

/** Require the current meta context in a component. */
export function requireRouter(): RouterStore {
	return requireContext(RouterContext, requireRouter);
}
