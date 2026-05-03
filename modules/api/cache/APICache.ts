import { awaitDispose } from "../../util/dispose.js";
import { setMapItem } from "../../util/map.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "../provider/APIProvider.js";
import { EndpointCache } from "./EndpointCache.js";

/**
 * Cache of `EndpointCache` objects for multiple endpoints.
 * - Use `get(endpoint)` to retrieve or create the `EndpointCache` for a given endpoint, then `get(payload)` on that to get a specific `EndpointStore`.
 */
export class APICache<P, R> implements AsyncDisposable {
	private readonly _endpoints = new Map<Endpoint, EndpointCache>();

	readonly provider: APIProvider<P, R>;

	constructor(provider: APIProvider<P, R>) {
		this.provider = provider;
	}

	private _get<PP, RR>(endpoint: Endpoint<PP, RR>): EndpointCache<PP, RR> | undefined;
	private _get(endpoint: Endpoint): EndpointCache | undefined {
		return this._endpoints.get(endpoint);
	}

	/** Get (or create) the `EndpointCache` for the given endpoint. */
	get<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): EndpointCache<PP, RR>;
	get(endpoint: Endpoint): EndpointCache {
		return this._get(endpoint) || setMapItem(this._endpoints, endpoint, new EndpointCache(endpoint, this.provider));
	}

	/**
	 * Fetch (or return a cached result) for the given endpoint and payload.
	 * - Returns the cached value immediately if one exists.
	 * - Waits for the in-flight fetch if the store is loading.
	 * - Throws if the fetch fails, matching `APIProvider.call` behaviour.
	 */
	async call<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): Promise<RR> {
		return this.get(endpoint).call(payload);
	}

	/** Invalidate a specific store for an endpoint. */
	invalidate<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._get(endpoint)?.invalidate(payload);
	}

	/** Invalidate all stores for an endpoint. */
	invalidateAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): void {
		this._get(endpoint)?.invalidateAll();
	}

	/** Trigger a refetch on a specific store for an endpoint. */
	refresh<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._get(endpoint)?.refresh(payload);
	}

	/** Trigger a refetch on all stores for an endpoint. */
	refreshAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): void {
		this._get(endpoint)?.refreshAll();
	}

	// Implement `AsyncDisposable`
	[Symbol.asyncDispose](): Promise<void> {
		return awaitDispose(
			...this._endpoints.values(), // Dispose all endpoints.
			() => this._endpoints.clear(), // Clear the endpoints.
		);
	}
}
