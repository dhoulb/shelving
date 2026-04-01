import type { AnyCaller } from "../../util/function.js";
import { mergeRequestOptions, type RequestOptions } from "../../util/http.js";
import { type PossibleURL, requireBaseURL, type URLString } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "./APIProvider.js";

/** Options for an `APIProvider`. */
export interface ClientAPIProviderOptions {
	/** The common base URL for all rendered endpoint requests. */
	readonly url: PossibleURL;

	/** Options used for HTTP requests created with `this.getRequest()` and `this.fetch()` */
	readonly options?: RequestOptions;
}

/** Provider for API endpoints rooted at a common base URL. */
export class ClientAPIProvider implements APIProvider {
	/** The common base URL for all rendered endpoint requests. */
	readonly url: URLString;

	/** Default options used for HTTP requests created with `this.getRequest()` and `this.fetch()` */
	readonly options: RequestOptions;

	constructor({ url, options = {} }: ClientAPIProviderOptions) {
		this.url = requireBaseURL(url, undefined, ClientAPIProvider);
		this.options = options;
	}

	async fetch<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller: AnyCaller = this.fetch): Promise<R> {
		const request = endpoint.getRequest(this.url, payload, mergeRequestOptions(this.options, options), caller);
		const response = await fetch(request);
		return endpoint.parseResponse(response, caller);
	}
}
