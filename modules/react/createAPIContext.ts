import type { ReactElement, ReactNode } from "react";
import { type AnyEndpointStore, EndpointStore } from "../api/cache/EndpointStore.js";
import type { Endpoint } from "../api/endpoint/Endpoint.js";
import type { APIProvider } from "../api/provider/APIProvider.js";
import { MINUTE } from "../util/constants.js";
import { setMapItem } from "../util/map.js";
import type { Nullish } from "../util/null.js";
import { createCacheContext } from "./createCacheContext.js";
import { useStore } from "./useStore.js";

const DEFAULT_MAX_AGE = 5 * MINUTE;

export interface APIContext {
	/** Get an `EndpointStore` for the specified endpoint/payload in the current `APIProvider` context. */
	useAPI<P, R>(this: void, endpoint: Endpoint<P, R>, payload: P, maxAge?: number): EndpointStore<P, R>;
	useAPI<P, R>(this: void, endpoint: Nullish<Endpoint<P, R>>, payload: P, maxAge?: number): EndpointStore<P, R> | undefined;
	readonly APIContext: ({ children }: { children: ReactNode }) => ReactElement;
}

/**
 * Create an API context.
 * - Allows React elements to call `useAPI()` to access endpoint stores in an API provider.
 * - Each mounted `APIContext` gets its own in-memory store cache.
 */
export function createAPIContext(provider: APIProvider): APIContext {
	const { CacheContext, useCache } = createCacheContext<AnyEndpointStore>();

	return {
		useAPI: <P, R>(endpoint: Nullish<Endpoint<P, R>>, payload: P, maxAge = DEFAULT_MAX_AGE): EndpointStore<P, R> | undefined => {
			const cache = useCache() as Map<string, EndpointStore<P, R>>;
			const key = endpoint && `${endpoint.toString()}?${JSON.stringify(payload)}`;
			const store = useStore(
				key && endpoint ? cache.get(key) || setMapItem(cache, key, new EndpointStore(endpoint, payload, provider)) : undefined,
			);
			if (store) store.refreshStale(maxAge);
			return store;
		},
		APIContext: CacheContext,
	} as APIContext;
}
