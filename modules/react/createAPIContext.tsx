import { createContext, type ReactElement, type ReactNode, use, useRef } from "react";
import type { AnyCaller } from "shelving/util/function";
import type { Endpoint } from "../api/endpoint/Endpoint.js";
import { APICache } from "../api/index.js";
import type { APIProvider } from "../api/provider/APIProvider.js";
import type { EndpointStore } from "../api/store/EndpointStore.js";
import { RequiredError } from "../error/RequiredError.js";
import type { Nullish } from "../util/null.js";
import { useStore } from "./useStore.js";

/**
 * Bundle of hooks and a provider component returned by `createAPIContext()`
 *
 * @see https://shelving.cc/react/APIContext
 */
export interface APIContext<P, R> {
	/** React hook to return an `EndpointStore` for the specified endpoint/payload in the current `APIProvider` context. */
	useAPI<PP extends P, RR extends R>(this: void, endpoint: Endpoint<PP, RR>, payload: PP): EndpointStore<PP, RR>;
	useAPI<PP extends P, RR extends R>(this: void, endpoint: Nullish<Endpoint<PP, RR>>, payload: PP): EndpointStore<PP, RR> | undefined;

	/** Provide an `APICache` as context to child nodes, to allow them to use `useAPI()` */
	readonly APIContext: (props: APIContextProps<P, R>) => ReactElement;

	/** Return the underlying `APICache` for `<APIContext>` */
	requireAPICache(): APICache<P, R>;
}

/**
 * Props for the `<APIContext>` component returned by `createAPIContext()`.
 *
 * @see https://shelving.cc/react/APIContextProps
 */
export interface APIContextProps<P, R> {
	readonly children?: ReactNode;
	/** The provider to call, in place of the one given to `createAPIContext()`. The context makes its own `APICache` for it, and a new one when it changes. */
	readonly provider?: APIProvider<P, R> | undefined;
	/** An `APICache` you made, used as it is. It wins over `provider`. */
	readonly cache?: APICache<P, R> | undefined;
}

/**
 * Create an API context.
 * - Allows React elements to call `useAPI()` to access endpoint stores in an API provider.
 * - Each mounted `APIContext` gets its own in-memory store cache, unless it gets a `cache` prop.
 * - The provider can be given here, or to each `<APIContext>` as its `provider` or `cache` prop, so each tree can have its own API.
 *
 * @param provider Default `APIProvider` the created context resolves endpoint stores against, when an `<APIContext>` gets no `provider` or `cache` prop.
 *
 * @see https://shelving.cc/react/createAPIContext
 */
export function createAPIContext<P, R>(provider?: APIProvider<P, R>): APIContext<P, R> {
	const CacheContext = createContext<APICache<P, R> | undefined>(undefined);

	function requireAPICache(caller: AnyCaller = requireAPICache): APICache<P, R> {
		const cache = use(CacheContext);
		if (!cache) throw new RequiredError(`Must be used inside <APIContext>`, { caller });
		return cache;
	}

	function useAPI<PP extends P, RR extends R>(endpoint: Nullish<Endpoint<PP, RR>>, payload: PP): EndpointStore<PP, RR> | undefined {
		return useStore(endpoint ? requireAPICache(useAPI).get(endpoint).get(payload) : undefined);
	}

	function APIContext({ children, provider: given = provider, cache }: APIContextProps<P, R>): ReactElement {
		const made = useRef<APICache<P, R>>(undefined);
		if (!cache) {
			if (!given) throw new RequiredError("<APIContext> needs a provider or a cache", { caller: APIContext });
			if (made.current?.provider !== given) made.current = new APICache(given);
		}
		return <CacheContext value={cache ?? made.current}>{children}</CacheContext>;
	}

	return { requireAPICache, useAPI, APIContext } as APIContext<P, R>;
}
