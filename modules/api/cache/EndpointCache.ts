import { AVOID_REFRESH } from "../../store/FetchStore.js";
import { awaitValues } from "../../util/async.js";
import { awaitDispose } from "../../util/dispose.js";
import type { AnyCaller } from "../../util/function.js";
import { setMapItem } from "../../util/map.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "../provider/APIProvider.js";
import { EndpointStore } from "../store/EndpointStore.js";

/**
 * Cache of `EndpointStore` objects for a single endpoint, keyed by the rendered request URL of each payload.
 * - Use `get(payload)` to retrieve or create the `EndpointStore` for a given payload.
 * - Disposing the cache disposes every nested `EndpointStore` and clears the map.
 *
 * @example
 * const cache = new EndpointCache(getUser, provider);
 * const user = await cache.call({ id: "abc" });
 *
 * @see https://shelving.cc/api/EndpointCache
 */
export class EndpointCache<P = unknown, R = unknown> implements AsyncDisposable {
	private readonly _endpoints = new Map<string, EndpointStore<P, R>>();

	/**
	 * The endpoint that every store in this cache fetches from.
	 *
	 * @see https://shelving.cc/api/EndpointCache/endpoint
	 */
	readonly endpoint: Endpoint<P, R>;

	/**
	 * The `APIProvider` used to render URLs and fetch results for this endpoint.
	 *
	 * @see https://shelving.cc/api/EndpointCache/provider
	 */
	readonly provider: APIProvider<P, R>;

	/**
	 * Create a new `EndpointCache` for a single endpoint and provider.
	 *
	 * @param endpoint The endpoint that every cached store fetches from.
	 * @param provider The `APIProvider` used to render URLs and fetch results.
	 * @example new EndpointCache(getUser, provider)
	 * @see https://shelving.cc/api/EndpointCache
	 */
	constructor(endpoint: Endpoint<P, R>, provider: APIProvider<P, R>) {
		this.endpoint = endpoint;
		this.provider = provider;
	}

	/**
	 * Get (or create) the `EndpointStore` for the given payload.
	 * - Stores are keyed by the rendered request URL, so equivalent payloads share a store.
	 *
	 * @param payload The payload identifying the store to return.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The existing `EndpointStore` for `payload`, or a newly created one.
	 * @example cache.get({ id: "abc" })
	 * @see https://shelving.cc/api/EndpointCache/get
	 */
	get(payload: P, caller: AnyCaller = this.get): EndpointStore<P, R> {
		const url = this.provider.renderURL(this.endpoint, payload, caller).href;
		return this._endpoints.get(url) || setMapItem(this._endpoints, url, new EndpointStore(this.endpoint, payload, this.provider));
	}

	/**
	 * Fetch (or return a cached result) for the given payload.
	 * - Returns the cached value immediately if one exists.
	 * - Waits for the in-flight fetch if the store is loading.
	 * - Throws if the fetch fails, matching `APIProvider.call` behaviour.
	 *
	 * @param payload The payload to send to the endpoint.
	 * @param maxAge The maximum age in milliseconds (defaults to only refreshing if the value is still in a loading state).
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The cached or freshly fetched result.
	 * @throws Whatever `APIProvider.call` throws if the fetch fails.
	 * @example await cache.call({ id: "abc" })
	 * @see https://shelving.cc/api/EndpointCache/call
	 */
	async call(payload: P, maxAge: number = AVOID_REFRESH, caller: AnyCaller = this.call): Promise<R> {
		const store = this.get(payload, caller);
		await store.refresh(maxAge);
		return store.value;
	}

	/**
	 * Invalidate a specific store so the next read refetches.
	 *
	 * @param payload The payload identifying the store to invalidate.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @example cache.invalidate({ id: "abc" })
	 * @see https://shelving.cc/api/EndpointCache/invalidate
	 */
	invalidate(payload: P, caller: AnyCaller = this.invalidate): void {
		this.get(payload, caller)?.invalidate();
	}

	/**
	 * Invalidate all stores so the next read of any payload refetches.
	 *
	 * @example cache.invalidateAll()
	 * @see https://shelving.cc/api/EndpointCache/invalidateAll
	 */
	invalidateAll(): void {
		for (const store of this._endpoints.values()) store.invalidate();
	}

	/**
	 * Trigger a refetch on a specific store.
	 *
	 * @param payload The payload identifying the store to refresh.
	 * @param maxAge The maximum age in milliseconds before a refetch is triggered.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns A promise that resolves when the refetch settles.
	 * @example await cache.refresh({ id: "abc" })
	 * @see https://shelving.cc/api/EndpointCache/refresh
	 */
	async refresh(payload: P, maxAge?: number, caller: AnyCaller = this.invalidate): Promise<void> {
		await this.get(payload, caller)?.refresh(maxAge);
	}

	/**
	 * Trigger a refetch on all stores.
	 *
	 * @param maxAge The maximum age in milliseconds before a refetch is triggered.
	 * @returns A promise that resolves when every refetch settles.
	 * @example await cache.refreshAll()
	 * @see https://shelving.cc/api/EndpointCache/refreshAll
	 */
	async refreshAll(maxAge?: number): Promise<void> {
		await awaitValues(...this._endpoints.values().map(store => store.refresh(maxAge)));
	}

	// Implement `AsyncDisposable`
	[Symbol.asyncDispose](): Promise<void> {
		return awaitDispose(
			...this._endpoints.values(), // Dispose all endpoints.
			() => this._endpoints.clear(), // Clear the endpoints.
		);
	}
}
