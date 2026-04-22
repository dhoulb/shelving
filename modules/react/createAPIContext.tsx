import { createContext, type ReactElement, type ReactNode, use } from "react";
import type { Endpoint } from "../api/endpoint/Endpoint.js";
import { APICache } from "../api/index.js";
import type { APIProvider } from "../api/provider/APIProvider.js";
import type { EndpointStore } from "../api/store/EndpointStore.js";
import { RequiredError } from "../error/RequiredError.js";
import type { Nullish } from "../util/null.js";
import { useInstance } from "./useInstance.js";
import { useStore } from "./useStore.js";

export interface APIContext<P, R> {
	/** Get an `EndpointStore` for the specified endpoint/payload in the current `APIProvider` context. */
	useAPI<PP extends P, RR extends R>(this: void, endpoint: Endpoint<PP, RR>, payload: PP): EndpointStore<PP, RR>;
	useAPI<PP extends P, RR extends R>(this: void, endpoint: Nullish<Endpoint<PP, RR>>, payload: PP): EndpointStore<PP, RR> | undefined;

	/** The `<APIContext>` wrapper to give your React components access to this API provider. */
	readonly APIContext: ({ children }: { children: ReactNode }) => ReactElement;
}

/**
 * Create an API context.
 * - Allows React elements to call `useAPI()` to access endpoint stores in an API provider.
 * - Each mounted `APIContext` gets its own in-memory store cache.
 *
 * @todo Use and integreate our `EndpointCache` functionality and use it in this.
 */
export function createAPIContext<P, R>(provider: APIProvider<P, R>): APIContext<P, R> {
	const CacheContext = createContext<APICache<P, R> | undefined>(undefined);

	function useAPI<PP extends P, RR extends R>(endpoint: Nullish<Endpoint<PP, RR>>, payload: PP): EndpointStore<PP, RR> | undefined {
		const cache = use(CacheContext);
		if (!cache) throw new RequiredError(`useAPI() can only be used inside <APIContext>`, { caller: useAPI });
		return useStore(endpoint ? cache.get(endpoint).get(payload) : undefined);
	}

	function APIContext({ children }: { children: ReactNode }): ReactElement {
		const cache = useInstance(APICache, provider);
		return <CacheContext value={cache}>{children}</CacheContext>;
	}

	return { useAPI, APIContext } as APIContext<P, R>;
}
