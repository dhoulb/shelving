import { useContext, createContext, createElement } from "react";
import { ConditionError } from "../error/ConditionError.js";
import { useReduce } from "./useReduce.js";

/**
 * Controller that creates an independent cache.
 * - The cache is a `Map` instance that stores indexed items.
 */
export class CacheController<T> {
	protected _context = createContext<Map<string, T> | undefined>(undefined);

	/** Use this cache in a component. */
	readonly useCache = (): Map<string, T> => {
		const cache = useContext(this._context);
		if (!cache) throw new ConditionError("useCache() must be used inside <Cache>");
		return cache;
	};

	/** Component that provides a cache of this type to its children. */
	readonly Cache = ({ children }: { children: React.ReactNode }): React.ReactElement | null => {
		const cache = useReduce<Map<string, T>>(_reduceMap);
		return createElement(this._context.Provider, { children, value: cache });
	};
}

/** Reducer that gets an existing `Map` instance or creates a new one. */
const _reduceMap = <T>(previous: Map<string, T> | undefined) => previous || new Map<string, T>();

/**
 * Default cache
 * - This is a flexible generic cache intended to be the default.
 * - Use this cache unless
 */
export const CACHE = new CacheController<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

/** Use a global cache in a component. */
export const useCache = CACHE.useCache;

/** Component that provides a global cache to its children. */
export const Cache = CACHE.Cache;
