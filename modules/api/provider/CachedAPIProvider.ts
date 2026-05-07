import { AVOID_REFRESH } from "../../store/FetchStore.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import { APICache } from "../cache/APICache.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "./APIProvider.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/**
 * API provider wrapper that serves requests through an `APICache`.
 * - Constructor accepts a `source` provider and an optional default `maxAge`.
 * - On `call(...)`, triggers `cache.refresh(maxAge)` for the endpoint+payload before awaiting `cache.call(...)`.
 * - `invalidate`, `invalidateAll`, `refresh`, and `refreshAll` pass through to the underlying cache and use `this.maxAge` as the default refresh timing.
 *
 * @param `maxAge` The maximum age used when calling `call()` (defaults to `AVOID_REFRESH`, i.e. only refresh if the value is invalidated or still loading).
 * - Note: This is not used for `refresh()` calls — when you call `refresh()` you likely mean "do it now".
 * - When we are using `call()` on a cache, the entire point of the cache is to "cache", so the default isn't `0` like it is for `refresh()`
 */
export class CachedAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	readonly maxAge: number | undefined;
	private readonly _cache: APICache<P, R>;

	constructor(source: APIProvider<P, R>, maxAge: number = AVOID_REFRESH) {
		super(source);
		this.maxAge = maxAge;
		this._cache = new APICache(source);
	}

	// Override call to use the cache racther than calling fresh each time.
	override call<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		_options?: RequestOptions,
		caller: AnyCaller = this.call,
	): Promise<RR> {
		return this._cache.call(endpoint, payload, this.maxAge, caller);
	}

	invalidate<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._cache.invalidate(endpoint, payload);
	}

	invalidateAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): void {
		this._cache.invalidateAll(endpoint);
	}

	refresh<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP): void {
		this._cache.refresh(endpoint, payload, this.maxAge);
	}

	refreshAll<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>): void {
		this._cache.refreshAll(endpoint, this.maxAge);
	}
}
