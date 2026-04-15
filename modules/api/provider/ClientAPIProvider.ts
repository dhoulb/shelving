import { ResponseError } from "../../error/ResponseError.js";
import { isData } from "../../util/data.js";
import { getMessage } from "../../util/error.js";
import type { AnyCaller } from "../../util/function.js";
import {
	assertRequestHeadPayload,
	getHeadRequest,
	getRequest,
	isRequestHeadMethod,
	mergeRequestOptions,
	parseResponseBody,
	type RequestBodyMethod,
	type RequestHeadMethod,
	type RequestOptions,
} from "../../util/http.js";
import type { Nullish } from "../../util/null.js";
import { omitProps } from "../../util/object.js";
import { type PossibleURIParams, withURIParams } from "../../util/uri.js";
import { type PossibleURL, requireBaseURL, requireURL, type URL, type URLString } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { APIProvider } from "./APIProvider.js";

/** Options for a `ClientAPIProvider`. */
export interface ClientAPIProviderOptions {
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

export class ClientAPIProvider<P = unknown, R = unknown> extends APIProvider<P, R> {
	/** The common base URL for all rendered endpoint requests. */
	readonly url: URLString;

	/** Default options used for HTTP requests created with `this.getRequest()` and `this.fetch()` */
	readonly options: RequestOptions;

	/** Timeout in milliseconds, or `undefined` for no timeout. */
	readonly timeout: number | undefined;

	constructor({ url, options = {}, timeout }: ClientAPIProviderOptions) {
		super();
		this.url = requireBaseURL(url, undefined, ClientAPIProvider);
		this.options = options;
		this.timeout = timeout;
	}

	renderURL<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP, caller: AnyCaller = this.renderURL): URL {
		const url = requireURL(`.${endpoint.renderPath(payload, caller)}`, this.url, caller);

		// HEAD or GET have no body (but payload can only be data object).
		if (isRequestHeadMethod(endpoint.method)) {
			assertRequestHeadPayload(payload, endpoint.method, caller);
			if (payload) {
				const params = endpoint.placeholders.length ? omitProps(payload, ...endpoint.placeholders) : payload; // Omit any params that have already been embedded as `{placeholders}`.
				return withURIParams(url, params, caller);
			}
		}

		return url;
	}

	getRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.getRequest,
	): Request {
		// Render the path into the base URL.
		const url = this.renderURL(endpoint, payload, caller);

		// Merge the param options with `this.options`
		// If we have a timeout set, create an `AbortSignal` for it.
		const signal = this.timeout ? AbortSignal.timeout(this.timeout) : null;
		const mergedOptions = mergeRequestOptions({ signal, ...this.options }, options);

		// HEAD or GET requests need no payload because it was already rendered into the URL as `?query` params by `this.renderURL()`
		if (isRequestHeadMethod(endpoint.method)) return this._getHeadRequest(endpoint.method, url, undefined, mergedOptions, caller);

		// Body request.
		const body: P = isData(payload) ? (omitProps(payload, ...endpoint.placeholders) as P) : payload; // Omit any params that have already been embedded as `{placeholders}`.
		return this._getBodyRequest(endpoint.method, url, body, mergedOptions, caller);
	}

	/** Internal implementation function for `getRequest()` used for requests that have no body. */
	protected _getHeadRequest(
		method: RequestHeadMethod, //
		url: PossibleURL,
		params: Nullish<PossibleURIParams>,
		options: RequestOptions,
		caller: AnyCaller,
	): Request {
		return getHeadRequest(method, url, params, options, caller);
	}

	/** Internal implementation function for `getRequest()` used for requests that have a body.  */
	protected _getBodyRequest(
		method: RequestBodyMethod, //
		url: PossibleURL,
		payload: P,
		options: RequestOptions,
		caller: AnyCaller,
	): Request {
		return getRequest(method, url, payload, options, caller);
	}

	async parseResponse<PP extends P, RR extends R>(
		_endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		const { ok, status } = response;
		const content = await parseResponseBody(response, caller);
		if (!ok) throw new ResponseError(getMessage(content) ?? `Error ${status}`, { code: status, cause: response, caller });
		return content as RR;
	}
}
