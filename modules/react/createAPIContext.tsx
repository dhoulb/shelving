import { createContext, type ReactElement, type ReactNode, use } from "react";
import type { Endpoint } from "../api/endpoint/Endpoint.js";
import { APICache } from "../api/index.js";
import type { APIProvider } from "../api/provider/APIProvider.js";
import type { EndpointStore } from "../api/store/EndpointStore.js";
import { RequiredError } from "../error/RequiredError.js";
import { MINUTE } from "../util/constants.js";
import type { Nullish } from "../util/null.js";
import { useInstance } from "./useInstance.js";
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
 *
 * @todo Use and integreate our `EndpointCache` functionality and use it in this.
 */
export function createAPIContext(provider: APIProvider): APIContext {
	const CacheContext = createContext<APICache | undefined>(undefined);

	function useAPI<P, R>(endpoint: Nullish<Endpoint<P, R>>, payload: P, maxAge = DEFAULT_MAX_AGE): EndpointStore<P, R> | undefined {
		const cache = use(CacheContext);
		if (!cache) throw new RequiredError(`useAPI() can only be used inside <APIContext>`, { caller: useAPI });
		const store = endpoint ? cache.get(endpoint).get(payload) : undefined;
		if (store) store.refreshStale(maxAge);
		return useStore(store);
	}

	function APIContext({ children }: { children: ReactNode }): ReactElement {
		const cache = useInstance(APICache, provider);
		return <CacheContext value={cache}>{children}</CacheContext>;
	}

	return { useAPI, APIContext } as APIContext;
}
