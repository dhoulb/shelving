import { PayloadFetchStore } from "../../store/PayloadFetchStore.js";
import { NONE } from "../../util/constants.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "../provider/APIProvider.js";

/** Store object that loads a result from an API endpoint and provider. */
export class EndpointStore<P, R> extends PayloadFetchStore<P, R> implements Disposable {
	readonly provider: APIProvider<P, R>;
	readonly endpoint: Endpoint<P, R>;

	constructor(endpoint: Endpoint<P, R>, payload: P, provider: APIProvider<P, R>) {
		super(payload, NONE);
		this.endpoint = endpoint;
		this.provider = provider;
	}

	// Override to fetch the value using the provider and endpoint.
	protected override _fetch(): Promise<R> {
		return this.provider.call(this.endpoint, this.payload.value, { signal: this.signal });
	}
}
