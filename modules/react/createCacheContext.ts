import { type ReactElement, type ReactNode, createContext, createElement, useContext, useRef } from "react";
import { StateError } from "../error/StateError.js";

/**
 * Create a cache context that can be provided to React elements and allows them to call `useCache()`
 * - Cache is a `Map` indexed by strings that can be used to store any value.
 */
export function createCacheContext<T>(): {
	/** Wrap around a set of elements to provide the cache to them. */
	readonly CacheContext: ({ children }: { children: ReactNode }) => ReactElement;
	/** Use the current cache map in a component. */
	readonly useCache: () => Map<string, T>;
} {
	const context = createContext<Map<string, T> | undefined>(undefined);
	return {
		useCache() {
			const cache = useContext(context);
			if (!cache) throw new StateError("useCache() must be used inside <Cache>");
			return cache;
		},
		CacheContext({ children }: { children: ReactNode }): ReactElement {
			// biome-ignore lint/suspicious/noAssignInExpressions: This is the most efficient way to do this.
			const cache = (useRef<Map<string, T>>().current ||= new Map());
			return createElement(context.Provider, { children, value: cache });
		},
	};
}
