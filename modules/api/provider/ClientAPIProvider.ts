import { ResponseError } from "../../error/ResponseError.js";
import type { Data } from "../../util/data.js";
import { getMessage } from "../../util/error.js";
import type { AnyCaller } from "../../util/function.js";
import { getRequest, getResponseContent, mergeRequestOptions, type RequestOptions } from "../../util/http.js";
import { omitProps } from "../../util/object.js";
import { type PossibleURL, requireBaseURL, requireURL, type URLString } from "../../util/url.js";
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

	/**
	 * Create a `Request` that targets this endpoint with a given base URL.
	 * - Path `{placeholders}` are rendered from the payload.
	 * - For `GET` and `HEAD`, remaining payload fields are appended as `?query` params.
	 * - For all other requests, payload is sent as the body.
	 *
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
	 */
	getRequest<P>(endpoint: Endpoint<P, unknown>, payload: P, options?: RequestOptions, caller: AnyCaller = this.getRequest): Request {
		const url = requireURL(`.${endpoint.renderPath(payload, caller)}`, requireBaseURL(this.url, undefined, caller), caller).href;
		if (endpoint.placeholders.length)
			return getRequest(endpoint.method, url, omitProps(payload as Data, ...endpoint.placeholders), options);
		return getRequest(endpoint.method, url, payload, options);
	}

	/**
	 * Parse an HTTP `Response` for this endpoint.
	 * - Non-2xx responses become `ResponseError`.
	 * - Does not validate the result against the endpoint schema — use `ValidationAPIProvider` for that.
	 */
	async parseResponse<R>(_endpoint: Endpoint<unknown, R>, response: Response, caller: AnyCaller = this.parseResponse): Promise<R> {
		const { ok, status } = response;
		const content = await getResponseContent(response, caller);
		if (!ok) throw new ResponseError(getMessage(content) ?? `Error ${status}`, { code: status, cause: response, caller });
		return content as R;
	}

	async fetch<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller: AnyCaller = this.fetch): Promise<R> {
		const request = this.getRequest(endpoint, payload, mergeRequestOptions(this.options, options), caller);
		const response = await fetch(request);
		return this.parseResponse(endpoint, response, caller);
	}
}
