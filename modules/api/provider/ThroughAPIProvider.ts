import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { URL, URLString } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "./APIProvider.js";

/**
 * Provider wrapper that delegates API operations to a source provider.
 * - Extend this when you want to intercept only selected API operations, such as injecting auth headers or logging.
 */
export class ThroughAPIProvider implements APIProvider {
	readonly source: APIProvider;

	get url(): URLString {
		return this.source.url;
	}
	get options(): RequestOptions {
		return this.source.options;
	}
	get timeout(): number | undefined {
		return this.source.timeout;
	}

	constructor(source: APIProvider) {
		this.source = source;
	}

	renderURL<P, R>(endpoint: Endpoint<P, R>, payload: P, caller: AnyCaller = this.renderURL): URL {
		return this.source.renderURL(endpoint, payload, caller);
	}

	getRequest<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller: AnyCaller = this.getRequest): Request {
		return this.source.getRequest(endpoint, payload, options, caller);
	}

	parseResponse<P, R>(endpoint: Endpoint<P, R>, response: Response, caller: AnyCaller = this.parseResponse): Promise<R> {
		return this.source.parseResponse(endpoint, response, caller);
	}

	fetch<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller: AnyCaller = this.fetch): Promise<R> {
		return this.source.fetch(endpoint, payload, options, caller);
	}
}
