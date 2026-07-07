import { createContext, type ReactElement, use } from "react";
import type { Endpoint } from "../api/endpoint/Endpoint.js";
import { APICache } from "../api/index.js";
import type { APIProvider } from "../api/provider/APIProvider.js";
import type { EndpointStore } from "../api/store/EndpointStore.js";
import { RequiredError } from "../error/RequiredError.js";
import type { ChildProps } from "../ui/index.js";
import type { Nullish } from "../util/null.js";
import { useInstance } from "./useInstance.js";
import { useStore } from "./useStore.js";
import type { AnyCaller } from "shelving/util/function";

/**
 * Bundle of hooks and a provider component returned by `createAPIContext()`
 *
 * @see https://shelving.cc/react/APIContext
 */
export interface APIContext<P, R> {
	/** React hook to return an `EndpointStore` for the specified endpoint/payload in the current `APIProvider` context. */
	useAPI<PP extends P, RR extends R>(this: void, endpoint: Endpoint<PP, RR>, payload: PP): EndpointStore<PP, RR>;
	useAPI<PP extends P, RR extends R>(this: void, endpoint: Nullish<Endpoint<PP, RR>>, payload: PP): EndpointStore<PP, RR> | undefined;

	/** Create a new `APICache` and provide it as context to child nodes, to allow them to use `useAPI()` */
	readonly APIContext: (props: ChildProps) => ReactElement;

	/** Return the underlying `APICache` for `<APIContext>` */
	requireAPICache(): APICache<P, R>;
}

/**
 * Create an API context.
 * - Allows React elements to call `useAPI()` to access endpoint stores in an API provider.
 * - Each mounted `APIContext` gets its own in-memory store cache.
 *
 * @param provider `APIProvider` the created context resolves endpoint stores against.
 *
 * @see https://shelving.cc/react/createAPIContext
 */
export function createAPIContext<P, R>(provider: APIProvider<P, R>): APIContext<P, R> {
	const CacheContext = createContext<APICache<P, R> | undefined>(undefined);

	function requireAPICache(caller: AnyCaller = requireAPICache): APICache<P, R> {
		const cache = use(CacheContext);
		if (!cache) throw new RequiredError(`Must be used inside <APIContext>`, { caller });
		return cache;
	}

	function useAPI<PP extends P, RR extends R>(endpoint: Nullish<Endpoint<PP, RR>>, payload: PP): EndpointStore<PP, RR> | undefined {
		return useStore(endpoint ? requireAPICache(useAPI).get(endpoint).get(payload) : undefined);
	}

	function APIContext({ children }: ChildProps): ReactElement {
		const cache = useInstance(APICache, provider);
		return <CacheContext value={cache}>{children}</CacheContext>;
	}

	return { requireAPICache, useAPI, APIContext } as APIContext<P, R>;
}
