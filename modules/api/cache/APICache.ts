import { AVOID_REFRESH } from "../../store/FetchStore.js";
import { awaitDispose } from "../../util/dispose.js";
import type { AnyCaller } from "../../util/function.js";
import { setMapItem } from "../../util/map.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "../provider/APIProvider.js";
import { EndpointCache } from "./EndpointCache.js";

/**
 * Cache of [`EndpointCache`](/api/EndpointCache) objects keyed by [`Endpoint`](/api/Endpoint), providing memoised API results across many endpoints.
 * - Use `get(endpoint)` to retrieve or create the `EndpointCache` for a given endpoint, then `get(payload)` on that to get a specific [`EndpointStore`](/api/EndpointStore).
 * - Disposing the cache disposes every nested `EndpointCache` and clears the map.
 *
 * @example
 * const cache = new APICache(provider);
 * const user = await cache.call(getUser, { id: "abc" });
 *
 * @see https://dhoulb.github.io/shelving/api/cache/APICache/APICache
 */
export class APICache<P, R> implements AsyncDisposable {
	private readonly _endpoints = new Map<Endpoint, EndpointCache>();

	/**
	 * The underlying [`APIProvider`](/api/APIProvider) that backs every cached endpoint.
	 *
	 * @see https://dhoulb.github.io/shelving/api/cache/APICache/APICache/provider
	 */
	readonly provider: APIProvider<P, R>;

	/**
	 * Create a new `APICache` backed by an [`APIProvider`](/api/APIProvider).
	 *
	 * @param provider The `APIProvider` used to fetch results for every cached endpoint.
	 * @example new APICache(provider)
	 * @see https://dhoulb.github.io/shelving/api/cache/APICache/APICache
	 */
	constructor(provider: APIProvider<P, R>) {
		this.provider = provider;
	}

	private _get<PP, RR>(endpoint: Endpoint<PP, RR>): EndpointCache<PP, RR> | undefined;
	private _get(endpoint: Endpoint): EndpointCache | undefined {
		return this._endpoints.get(endpoint);
	}

	/**
	 * Get (or create) the [`EndpointCache`](/api/EndpointCache) for the given endpoint.
	 *
	 * @param endpoint The endpoint whose `EndpointCache` should be returned.
	 * @returns The existing `EndpointCache` for `endpoint`, or a newly created one.
	 * @example cache.get(getUser).get({ id: "abc" })
	 * @see https://dhoulb.github.io/shelving/api/cache/APICache/APICache/get
	 */
	get<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): EndpointCache<PP, RR>;
	get(endpoint: Endpoint): EndpointCache {
		return this._get(endpoint) || setMapItem(this._endpoints, endpoint, new EndpointCache(endpoint, this.provider));
	}

	/**
	 * Fetch (or return a cached result) for the given endpoint and payload.
	 * - Returns the cached value immediately if one exists.
	 * - Waits for the in-flight fetch if the store is loading.
	 * - Throws if the fetch fails, matching [`APIProvider.call`](/api/APIProvider/call) behaviour.
	 *
	 * @param endpoint The endpoint to fetch a result for.
	 * @param payload The payload to send to the endpoint.
	 * @param maxAge The maximum age in milliseconds (defaults to only refreshing if the value is still in a loading state).
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The cached or freshly fetched result.
	 * @throws Whatever `APIProvider.call` throws if the fetch fails.
	 * @example await cache.call(getUser, { id: "abc" })
	 * @see https://dhoulb.github.io/shelving/api/cache/APICache/APICache/call
	 */
	async call<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		maxAge: number = AVOID_REFRESH,
		caller: AnyCaller = this.call,
	): Promise<RR> {
		return this.get(endpoint).call(payload, maxAge, caller);
	}

	/**
	 * Invalidate a specific store for an endpoint so the next read refetches.
	 *
	 * @param endpoint The endpoint whose cached payload should be invalidated.
	 * @param payload The payload identifying the specific store to invalidate.
	 * @example cache.invalidate(getUser, { id: "abc" })
	 * @see https://dhoulb.github.io/shelving/api/cache/APICache/APICache/invalidate
	 */
	invalidate<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._get(endpoint)?.invalidate(payload);
	}

	/**
	 * Invalidate all stores for an endpoint so the next read of any payload refetches.
	 *
	 * @param endpoint The endpoint whose stores should all be invalidated.
	 * @example cache.invalidateAll(getUser)
	 * @see https://dhoulb.github.io/shelving/api/cache/APICache/APICache/invalidateAll
	 */
	invalidateAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): void {
		this._get(endpoint)?.invalidateAll();
	}

	/**
	 * Trigger a refetch on a specific store for an endpoint.
	 *
	 * @param endpoint The endpoint whose store should be refreshed.
	 * @param payload The payload identifying the specific store to refresh.
	 * @param maxAge The maximum age in milliseconds before a refetch is triggered.
	 * @example cache.refresh(getUser, { id: "abc" })
	 * @see https://dhoulb.github.io/shelving/api/cache/APICache/APICache/refresh
	 */
	refresh<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP, maxAge?: number): void {
		this._get(endpoint)?.refresh(payload, maxAge);
	}

	/**
	 * Trigger a refetch on all stores for an endpoint.
	 *
	 * @param endpoint The endpoint whose stores should all be refreshed.
	 * @param maxAge The maximum age in milliseconds before a refetch is triggered.
	 * @example cache.refreshAll(getUser)
	 * @see https://dhoulb.github.io/shelving/api/cache/APICache/APICache/refreshAll
	 */
	refreshAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, maxAge?: number): void {
		this._get(endpoint)?.refreshAll(maxAge);
	}

	// Implement `AsyncDisposable`
	[Symbol.asyncDispose](): Promise<void> {
		return awaitDispose(
			...this._endpoints.values(), // Dispose all endpoints.
			() => this._endpoints.clear(), // Clear the endpoints.
		);
	}
}
