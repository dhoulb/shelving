import { awaitDispose } from "../../util/dispose.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Sourceable } from "../../util/source.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { APIProvider } from "./APIProvider.js";

/**
 * Provider wrapper that delegates every API operation to a wrapped `source` provider.
 * - Extend this when you want to intercept only selected API operations, such as injecting auth headers or logging.
 * - Implements `Sourceable` so wrapped providers are discoverable via `getSource()` / `requireSource()`.
 *
 * @see https://shelving.cc/api/ThroughAPIProvider
 */
export class ThroughAPIProvider<P, R> extends APIProvider<P, R> implements Sourceable<APIProvider<P, R>> {
	override get url(): URL {
		return this.source.url;
	}

	/**
	 * The wrapped source provider that operations delegate to.
	 *
	 * @see https://shelving.cc/api/ThroughAPIProvider/source
	 */
	readonly source: APIProvider<P, R>;

	constructor(source: APIProvider<P, R>) {
		super();
		this.source = source;
	}

	override renderURL<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP, caller: AnyCaller = this.renderURL): URL {
		return this.source.renderURL(endpoint, payload, caller);
	}

	override createRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.createRequest,
	): Request {
		return this.source.createRequest(endpoint, payload, options, caller);
	}

	override parseResponse<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		return this.source.parseResponse(endpoint, response, caller);
	}

	override fetch(request: Request): Promise<Response> {
		return this.source.fetch(request);
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose]() {
		await awaitDispose(
			this.source, // Dispose the source API provider.
		);
	}
}
