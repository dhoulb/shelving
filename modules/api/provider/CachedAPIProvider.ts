import { AVOID_REFRESH } from "../../store/FetchStore.js";
import { awaitDispose } from "../../util/dispose.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import { APICache } from "../cache/APICache.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "./APIProvider.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/**
 * API provider wrapper that serves requests through an `APICache` so repeated calls reuse cached results.
 * - On `call(...)`, triggers `cache.refresh(maxAge)` for the endpoint+payload before awaiting `cache.call(...)`.
 * - `invalidate`, `invalidateAll`, `refresh`, and `refreshAll` pass through to the underlying cache and use `this.maxAge` as the default refresh timing.
 *
 * @see https://shelving.cc/api/CachedAPIProvider
 */
export class CachedAPIProvider<P, R> extends ThroughAPIProvider<P, R> implements AsyncDisposable {
	/**
	 * The maximum age used when calling `call()`, defaulting to `AVOID_REFRESH` (only refresh if invalidated or still loading).
	 * - Not used for `refresh()` calls, which always refetch immediately.
	 * @see https://shelving.cc/api/CachedAPIProvider/maxAge
	 */
	readonly maxAge: number | undefined;
	private readonly _cache: APICache<P, R>;

	constructor(source: APIProvider<P, R>, maxAge: number = AVOID_REFRESH) {
		super(source);
		this.maxAge = maxAge;
		this._cache = new APICache(source);
	}

	/** Serves the call through the cache, reusing a cached result where possible; request options are ignored as the cache key is derived from `endpoint` and `payload`. */
	override call<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		_options?: RequestOptions,
		caller: AnyCaller = this.call,
	): Promise<RR> {
		return this._cache.call(endpoint, payload, this.maxAge, caller);
	}

	/**
	 * Invalidate the cached result for a specific endpoint and payload.
	 *
	 * @param endpoint The endpoint whose cached result should be invalidated.
	 * @param payload The payload identifying the cached result.
	 * @see https://shelving.cc/api/CachedAPIProvider/invalidate
	 */
	invalidate<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._cache.invalidate(endpoint, payload);
	}

	/**
	 * Invalidate every cached result for an endpoint, across all payloads.
	 *
	 * @param endpoint The endpoint whose cached results should be invalidated.
	 * @see https://shelving.cc/api/CachedAPIProvider/invalidateAll
	 */
	invalidateAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): void {
		this._cache.invalidateAll(endpoint);
	}

	/**
	 * Refresh the cached result for a specific endpoint and payload.
	 *
	 * @param endpoint The endpoint whose cached result should be refreshed.
	 * @param payload The payload identifying the cached result.
	 * @see https://shelving.cc/api/CachedAPIProvider/refresh
	 */
	refresh<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._cache.refresh(endpoint, payload, this.maxAge);
	}

	/**
	 * Refresh every cached result for an endpoint, across all payloads.
	 *
	 * @param endpoint The endpoint whose cached results should be refreshed.
	 * @see https://shelving.cc/api/CachedAPIProvider/refreshAll
	 */
	refreshAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): void {
		this._cache.refreshAll(endpoint, this.maxAge);
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose]() {
		await awaitDispose(
			this._cache, // Dispose the cache.
			super[Symbol.asyncDispose](), // Chain.
		);
	}
}
