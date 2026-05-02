import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Sourceable } from "../../util/source.js";
import type { BaseURL, URL } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { APIProvider } from "./APIProvider.js";

/**
 * Provider wrapper that delegates API operations to a source provider.
 * - Extend this when you want to intercept only selected API operations, such as injecting auth headers or logging.
 */
export class ThroughAPIProvider<P, R> extends APIProvider<P, R> implements Sourceable<APIProvider<P, R>> {
	get url(): BaseURL {
		return this.source.url;
	}

	readonly source: APIProvider<P, R>;

	constructor(source: APIProvider<P, R>) {
		super();
		this.source = source;
	}

	renderURL<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP, caller: AnyCaller = this.renderURL): URL {
		return this.source.renderURL(endpoint, payload, caller);
	}

	getRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.getRequest,
	): Request {
		return this.source.getRequest(endpoint, payload, options, caller);
	}

	parseResponse<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		return this.source.parseResponse(endpoint, response, caller);
	}

	override fetch(request: Request): Promise<Response> {
		return this.source.fetch(request);
	}
}
