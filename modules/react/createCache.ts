import { createContext, createElement, useContext } from "react";
import { ConditionError } from "../error/ConditionError.js";
import { useReduce } from "./useReduce.js";

/** Reducer that gets an existing `Map` instance or creates a new one. */
const _reduceMap = <T>(previous: Map<string, T> | undefined) => previous || new Map<string, T>();

/**
 * Interface for a cache controller.
 * - Cache is a `Map` indexed by strings that can be used to store any value.
 */
export interface CacheController<T> {
	/** Wrap around a set of elements to provide the cache to them. */
	readonly Cache: ({ children }: { children: React.ReactNode }) => React.ReactElement;
	/** Use the current cache map in a component. */
	readonly useCache: () => Map<string, T>;
}

/** Create a cache. */
export function createCache<T>(): CacheController<T> {
	const context = createContext<Map<string, T> | undefined>(undefined);
	return {
		useCache: () => {
			const cache = useContext(context);
			if (!cache) throw new ConditionError("useCache() must be used inside <Cache>");
			return cache;
		},
		Cache: ({ children }: { children: React.ReactNode }): React.ReactElement => {
			const cache = useReduce<Map<string, T>>(_reduceMap);
			return createElement(context.Provider, { children, value: cache });
		},
	};
}
