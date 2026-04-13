import { ResponseError } from "../../error/ResponseError.js";
import { isArrayItem } from "../../util/array.js";
import type { Data } from "../../util/data.js";
import { getMessage } from "../../util/error.js";
import type { AnyCaller } from "../../util/function.js";
import {
	assertHeadMethodPayload,
	getRequest,
	getResponseContent,
	HTTP_HEAD_METHODS,
	mergeRequestOptions,
	type RequestOptions,
} from "../../util/http.js";
import { omitProps } from "../../util/object.js";
import { withURIParams } from "../../util/uri.js";
import { type PossibleURL, requireBaseURL, requireURL, type URL, type URLString } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";

/** Options for an `APIProvider`. */
export interface APIProviderOptions {
	/** The common base URL for all rendered endpoint requests. */
	readonly url: PossibleURL;

	/**
	 * Options used for HTTP requests created with `this.getRequest()` and `this.fetch()`
	 * - Omits `signal` because it's not relevant at the provider level.
	 */
	readonly options?: Omit<RequestOptions, "signal">;

	/** Timeout in milliseconds, or `undefined` for no timeout. */
	readonly timeout?: number | undefined;
}

/** Provider for API endpoints rooted at a common base URL. */
export class APIProvider {
	/** The common base URL for all rendered endpoint requests. */
	readonly url: URLString;

	/** Default options used for HTTP requests created with `this.getRequest()` and `this.fetch()` */
	readonly options: RequestOptions;

	/** Timeout in milliseconds, or `undefined` for no timeout. */
	readonly timeout: number | undefined;

	constructor({ url, options = {}, timeout }: APIProviderOptions) {
		this.url = requireBaseURL(url, undefined, APIProvider);
		this.options = options;
		this.timeout = timeout;
	}

	/**
	 * Render the full final URL for an API request to a given endpoint with a given payload.
	 * - Includes `?query` params if this is a `HEAD` or `GET` request.
	 *
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
	 */
	renderURL<P, R>(endpoint: Endpoint<P, R>, payload: P, caller: AnyCaller = this.renderURL): URL {
		const url = requireURL(`.${endpoint.renderPath(payload, caller)}`, this.url, caller);

		// HEAD or GET have no body (but payload can only be data object).
		if (isArrayItem(HTTP_HEAD_METHODS, endpoint.method)) {
			assertHeadMethodPayload(payload, endpoint.method, caller);
			if (payload) {
				const params = endpoint.placeholders.length ? omitProps(payload, ...endpoint.placeholders) : payload; // Omit any params that were already embedded as `{placeholders}`
				return withURIParams(url, params, caller);
			}
		}

		return url;
	}

	/**
	 * Create a `Request` that targets this endpoint with a given base URL.
	 *
	 * @param payload The payload to embed into the `Request` to send to the endpoint.
	 * - Path `{placeholders}` are rendered from `payload`
	 * - For `GET` and `HEAD`, remaining `payload` fields are appended as `?query` params.
	 * - For all other requests, `payload` is sent as the body.
	 *
	 * @param options The `RequestOptions` to use when creating the `Request`
	 * - Merges `options` with `this.options` to make the final request options.
	 *
	 * @returns The created request.
	 * - Merges `options` with `this.options` to make the final request options.
	 * - Includes an `AbortSignal` based on `this.timeout` if it's set to a number in milliseconds.
	 * - The timeout `AbortSignal` is merged with any manual signal set in `
	 *
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
	 */
	getRequest<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller: AnyCaller = this.getRequest): Request {
		// Render the path into the base URL.
		const url = this.renderURL(endpoint, payload, caller);

		// Merge the param options with `this.options`
		// If we have a timeout set, create an `AbortSignal` for it.
		const signal = this.timeout ? AbortSignal.timeout(this.timeout) : null;
		const mergedOptions = mergeRequestOptions({ signal, ...this.options }, options);

		// HEAD or GET requests have no payload because it was already rendered into the URL as `?query` params.
		if (isArrayItem(HTTP_HEAD_METHODS, endpoint.method)) {
			return getRequest(endpoint.method, url, undefined, mergedOptions);
		}

		// Placeholders are rendered into the path so get omitted from the body payload.
		if (endpoint.placeholders.length) {
			const params = omitProps(payload as Data, ...endpoint.placeholders); // Omit any params that were already embedded as `{placeholders}`
			return getRequest(endpoint.method, url, params, mergedOptions);
		}

		// No placeholders.
		return getRequest(endpoint.method, url, payload, mergedOptions);
	}

	/**
	 * Parse an HTTP `Response` for this endpoint.
	 * - Non-2xx responses become `ResponseError`.
	 * - Does not validate the result against the endpoint schema — use `ValidationAPIProvider` for that.
	 */
	async parseResponse<P, R>(_endpoint: Endpoint<P, R>, response: Response, caller: AnyCaller = this.parseResponse): Promise<R> {
		const { ok, status } = response;
		const content = await getResponseContent(response, caller);
		if (!ok) throw new ResponseError(getMessage(content) ?? `Error ${status}`, { code: status, cause: response, caller });
		return content as R;
	}

	async fetch<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller: AnyCaller = this.fetch): Promise<R> {
		const request = this.getRequest(endpoint, payload, options, caller);
		const response = await fetch(request);
		return this.parseResponse(endpoint, response, caller);
	}
}
