import { setMapItem } from "../../util/map.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "../provider/APIProvider.js";
import { EndpointCache } from "./EndpointCache.js";

/**
 * Cache of `EndpointCache` objects for multiple endpoints.
 * - Use `get(endpoint)` to retrieve or create the `EndpointCache` for a given endpoint, then `get(payload)` on that to get a specific `EndpointStore`.
 */
export class APICache<P, R> implements Disposable {
	private readonly _caches = new Map<Endpoint, EndpointCache>();

	readonly provider: APIProvider<P, R>;

	constructor(provider: APIProvider<P, R>) {
		this.provider = provider;
	}

	private _get<PP, RR>(endpoint: Endpoint<PP, RR>): EndpointCache<PP, RR> | undefined;
	private _get(endpoint: Endpoint): EndpointCache | undefined {
		return this._caches.get(endpoint);
	}

	/** Get (or create) the `EndpointCache` for the given endpoint. */
	get<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): EndpointCache<PP, RR>;
	get(endpoint: Endpoint): EndpointCache {
		return this._get(endpoint) || setMapItem(this._caches, endpoint, new EndpointCache(endpoint, this.provider));
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
	refetch<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._get(endpoint)?.refetch(payload);
	}

	/** Trigger a refetch on all stores for an endpoint. */
	refetchAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): void {
		this._get(endpoint)?.refetchAll();
	}

	// Implement Disposable.
	[Symbol.dispose](): void {
		for (const cache of this._caches.values()) cache[Symbol.dispose]();
		this._caches.clear();
	}
}
