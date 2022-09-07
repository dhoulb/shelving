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
 * - Use this cache unless you want to cache a completely independent set of items without interference.
 */
export const CACHE = new CacheController<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Use a global cache in a component.
 * - Throws an error if used outside of `<Cache>`
 */
export const useCache: <T>() => Map<string, T> = CACHE.useCache;

/**
 * Component that provides a global cache to its children.
 *
 * Note: If mounted globally this cache will bloat over time, so you need a strategy to clear or reset the cache occasionally.
 *
 * A good strategy is to wrap a separate `<Cache>` around each page of your app.
 * This means the cache can only grow to the size of each page and the memory is released when the user navigates to a new page.
 * You might need to use `<Cache key="something unique to the page">` to ensure the cache component is destroyed and remounted for each page.
 *
 * Put a `<Suspense>` boundary _inside_ `<Cache>`
 * - This prevents promises being thrown up through the cache causing it to be destroyed.
 * - When the promise resolves and the render is tried again the data would not exist (because the cache was destroyed).
 * - This will cause an infinite loading loop.
 *
 * Put your error boundary _outside_ your `<Cache>`
 * - The error being thrown up through the cache causes it to be destroyed.
 * - This means when the uses tells the error boundary to try again (if supported) all data on the page will be retried.
 */
export const Cache = CACHE.Cache;
