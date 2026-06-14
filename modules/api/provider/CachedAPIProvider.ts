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
 * @example
 *  const api = new CachedAPIProvider(source);
 *  const result = await api.call(endpoint, payload);
 * @see https://dhoulb.github.io/shelving/api/provider/CachedAPIProvider/CachedAPIProvider
 */
export class CachedAPIProvider<P, R> extends ThroughAPIProvider<P, R> implements AsyncDisposable {
	/**
	 * The maximum age used when calling `call()`, defaulting to `AVOID_REFRESH` (only refresh if invalidated or still loading).
	 * - Not used for `refresh()` calls, which always refetch immediately.
	 * @see https://dhoulb.github.io/shelving/api/provider/CachedAPIProvider/CachedAPIProvider/maxAge
	 */
	readonly maxAge: number | undefined;
	private readonly _cache: APICache<P, R>;

	/**
	 * Create a cached provider wrapping a source provider.
	 *
	 * @param source The source provider whose results are cached.
	 * @param maxAge Default maximum age in milliseconds for `call()` (defaults to `AVOID_REFRESH`).
	 * @example new CachedAPIProvider(source)
	 */
	constructor(source: APIProvider<P, R>, maxAge: number = AVOID_REFRESH) {
		super(source);
		this.maxAge = maxAge;
		this._cache = new APICache(source);
	}

	/**
	 * Call an endpoint through the cache, reusing a cached result where possible instead of fetching fresh.
	 *
	 * @param endpoint The endpoint to call.
	 * @param payload The payload to call the endpoint with.
	 * @param _options Request options (unused; the cache key is derived from endpoint and payload).
	 * @param caller The calling function used for error stack traces.
	 * @returns Promise resolving to the (possibly cached) result.
	 * @example await api.call(endpoint, payload)
	 * @see https://dhoulb.github.io/shelving/api/provider/CachedAPIProvider/CachedAPIProvider/call
	 */
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
	 * @example api.invalidate(endpoint, payload)
	 * @see https://dhoulb.github.io/shelving/api/provider/CachedAPIProvider/CachedAPIProvider/invalidate
	 */
	invalidate<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._cache.invalidate(endpoint, payload);
	}

	/**
	 * Invalidate every cached result for an endpoint, across all payloads.
	 *
	 * @param endpoint The endpoint whose cached results should be invalidated.
	 * @example api.invalidateAll(endpoint)
	 * @see https://dhoulb.github.io/shelving/api/provider/CachedAPIProvider/CachedAPIProvider/invalidateAll
	 */
	invalidateAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): void {
		this._cache.invalidateAll(endpoint);
	}

	/**
	 * Refresh the cached result for a specific endpoint and payload.
	 *
	 * @param endpoint The endpoint whose cached result should be refreshed.
	 * @param payload The payload identifying the cached result.
	 * @example api.refresh(endpoint, payload)
	 * @see https://dhoulb.github.io/shelving/api/provider/CachedAPIProvider/CachedAPIProvider/refresh
	 */
	refresh<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._cache.refresh(endpoint, payload, this.maxAge);
	}

	/**
	 * Refresh every cached result for an endpoint, across all payloads.
	 *
	 * @param endpoint The endpoint whose cached results should be refreshed.
	 * @example api.refreshAll(endpoint)
	 * @see https://dhoulb.github.io/shelving/api/provider/CachedAPIProvider/CachedAPIProvider/refreshAll
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
