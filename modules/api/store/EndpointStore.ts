import { PayloadFetchStore } from "../../store/PayloadFetchStore.js";
import { NONE } from "../../util/constants.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "../provider/APIProvider.js";

/**
 * Store that loads and tracks the result of calling a single API endpoint with a fixed payload, through an `APIProvider`.
 *
 * @example
 *  const store = new EndpointStore(endpoint, payload, provider);
 *  const result = await store; // R
 * @see https://dhoulb.github.io/shelving/api/store/EndpointStore/EndpointStore
 */
export class EndpointStore<P, R> extends PayloadFetchStore<P, R> {
	/**
	 * The API provider this store calls the endpoint through.
	 * @see https://dhoulb.github.io/shelving/api/store/EndpointStore/EndpointStore/provider
	 */
	readonly provider: APIProvider<P, R>;
	/**
	 * The endpoint this store calls to fetch its result.
	 * @see https://dhoulb.github.io/shelving/api/store/EndpointStore/EndpointStore/endpoint
	 */
	readonly endpoint: Endpoint<P, R>;

	/**
	 * Create a store that tracks the result of an endpoint call.
	 *
	 * @param endpoint The endpoint to call.
	 * @param payload The payload to call the endpoint with.
	 * @param provider The API provider to call the endpoint through.
	 * @example new EndpointStore(endpoint, payload, provider)
	 */
	constructor(endpoint: Endpoint<P, R>, payload: P, provider: APIProvider<P, R>) {
		super(payload, NONE);
		this.endpoint = endpoint;
		this.provider = provider;
	}

	// Override to fetch the value using the provider and endpoint.
	protected override _fetch(signal: AbortSignal): Promise<R> {
		return this.provider.call(this.endpoint, this.payload.value, { signal });
	}
}
