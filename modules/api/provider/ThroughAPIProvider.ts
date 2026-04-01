import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "./APIProvider.js";
import type { ClientAPIProvider } from "./ClientAPIProvider.js";

/**
 * Provider wrapper that delegates API operations to a source provider.
 * - Extend this when you want to intercept only selected API operations, such as injecting auth headers or logging.
 */
export class ThroughAPIProvider implements APIProvider {
	readonly source: ClientAPIProvider;

	constructor(source: ClientAPIProvider) {
		this.source = source;
	}

	fetch<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller: AnyCaller = this.fetch): Promise<R> {
		return this.source.fetch(endpoint, payload, options, caller);
	}
}
