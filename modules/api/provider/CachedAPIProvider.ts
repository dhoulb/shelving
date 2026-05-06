import type { AnyCaller } from "../../util/function.js";
import { APICache } from "../cache/APICache.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "./APIProvider.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/**
 * API provider wrapper that serves requests through an `APICache`.
 * - Constructor accepts a `source` provider and an optional default `maxAge`.
 * - On `call(...)`, triggers `cache.refresh(maxAge)` for the endpoint+payload before awaiting `cache.call(...)`.
 * - `invalidate`, `invalidateAll`, `refresh`, and `refreshAll` pass through to the underlying cache and use `this.maxAge` as the default refresh timing.
 */
export class CachedAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	readonly maxAge: number | undefined;
	private readonly _cache: APICache<P, R>;

	constructor(source: APIProvider<P, R>, maxAge?: number) {
		super(source);
		this.maxAge = maxAge;
		this._cache = new APICache(source);
	}

	// @ts-expect-error TS2416: intentionally diverges from `APIProvider.call` — `RequestOptions` are not used by the cache, so the third arg is repurposed as `maxAge`.
	override call<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		maxAge: number | undefined = this.maxAge,
		caller: AnyCaller = this.call,
	): Promise<RR> {
		this._cache.refresh(endpoint, payload, maxAge);
		return this._cache.call(endpoint, payload, maxAge, caller);
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
