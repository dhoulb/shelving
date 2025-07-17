import { type ReactElement, type ReactNode, createContext, useContext } from "react";
import { UnexpectedError } from "../error/UnexpectedError.js";
import { useMap } from "./useMap.js";

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
	const Context = createContext<Map<string, T> | undefined>(undefined);
	const useCache = () => {
		const cache = useContext(Context);
		if (!cache) throw new UnexpectedError("useCache() must be used inside <CacheContext>", { caller: useCache });
		return cache;
	};
	const CacheContext = ({ children }: { children: ReactNode }): ReactElement => {
		const cache = useMap<string, T>();
		return <Context value={cache}>{children}</Context>;
	};
	return { useCache, CacheContext };
}
