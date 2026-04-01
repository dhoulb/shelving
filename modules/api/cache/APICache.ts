import { setMapItem } from "../../util/map.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { EndpointCache } from "./EndpointCache.js";

/**
 * Cache of `EndpointCache` objects for multiple endpoints.
 * - Use `get(endpoint)` to retrieve or create the `EndpointCache` for a given endpoint, then `get(payload)` on that to get a specific `EndpointStore`.
 */
export class APICache implements Disposable {
	// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
	private readonly _caches = new Map<Endpoint<any, any>, EndpointCache<any, any>>();

	/** Get (or create) the `EndpointCache` for the given endpoint. */
	get<P, R>(endpoint: Endpoint<P, R>): EndpointCache<P, R> {
		return this._caches.get(endpoint) || setMapItem(this._caches, endpoint, new EndpointCache(endpoint));
	}

	/** Invalidate a specific store for an endpoint. */
	invalidate<P, R>(endpoint: Endpoint<P, R>, payload: P): void {
		this._caches.get(endpoint)?.invalidate(payload);
	}

	/** Invalidate all stores for an endpoint. */
	invalidateAll<P, R>(endpoint: Endpoint<P, R>): void {
		this._caches.get(endpoint)?.invalidateAll();
	}

	/** Trigger a refetch on a specific store for an endpoint. */
	refetch<P, R>(endpoint: Endpoint<P, R>, payload: P): void {
		this._caches.get(endpoint)?.refetch(payload);
	}

	/** Trigger a refetch on all stores for an endpoint. */
	refetchAll<P, R>(endpoint: Endpoint<P, R>): void {
		this._caches.get(endpoint)?.refetchAll();
	}

	// Implement Disposable.
	[Symbol.dispose](): void {
		for (const cache of this._caches.values()) cache[Symbol.dispose]();
		this._caches.clear();
	}
}
