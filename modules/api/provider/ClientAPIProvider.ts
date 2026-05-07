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
import { type PossibleURL, requireBaseURL, requireURL } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { APIProvider } from "./APIProvider.js";

/** Options for a `ClientAPIProvider`. */
export interface ClientAPIProviderOptions {
	/**
	 * The common base URL for all rendered endpoint requests.
	 *
	 * Note: When resolving URLs for endpoints this is treated as if it ends in a slash.
	 * - e.g. in `http://p.com/a/b/c` the path will be relative to `c` as if a `/` trailing slash was present.
	 * - This is different to the default behaviour of `new URL()`, but is the more natural expected result
	 * - This is consistent with our e.g. `getURL()` utilities.
	 */
	readonly url: PossibleURL;

	/**
	 * Options used for HTTP requests created with `this.getRequest()` and `this.fetch()`
	 * - Omits `signal` because it's not relevant at the provider level.
	 */
	readonly options?: Omit<RequestOptions, "signal">;

	/**
	 * Timeout in milliseconds before the request is aborted with `TimeoutError`.
	 * - Defaults to `20_000` (20 seconds) — chosen to fire before common platform wall-clock caps (Cloudflare Workers ~30s, Vercel/AWS API Gateway ~29s) so the abort propagates as a clean rejection instead of an opaque runtime termination.
	 * - Pass `0` to disable the timeout (e.g. for streaming or long-poll endpoints). Raise it for specifically slow endpoints.
	 */
	readonly timeout?: number | undefined;
}

/**
 * A client-side API provider that sends requests over the network using `fetch()`.
 * - Can be used on a server environment to make outgoing API calls, or in a browser environment to call a server API.
 * - Renders endpoint paths and query params into the URL and sends body payloads as JSON.
 * - Parses JSON responses and throws `ResponseError` for non-2xx responses.
 * - Extendable with custom request-building and response-parsing logic by overriding `getRequest()` and `parseResponse()`.
 * - Wrap in `ValidationAPIProvider` to add automatic validation of request payloads and response results against endpoint schemas.
 */
export class ClientAPIProvider<P = unknown, R = unknown> extends APIProvider<P, R> {
	/** The common base URL for all rendered endpoint requests. */
	readonly url: URL;

	/** Default options used for HTTP requests created with `this.getRequest()` and `this.fetch()` */
	readonly options: RequestOptions;

	/** Timeout in milliseconds before the request is aborted, or `0` for no timeout. */
	readonly timeout: number;

	constructor({ url, options = {}, timeout = 20_000 }: ClientAPIProviderOptions) {
		super();
		this.url = requireBaseURL(url, ClientAPIProvider);
		this.options = options;
		this.timeout = timeout;
	}

	renderURL<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP, caller: AnyCaller = this.renderURL): URL {
		// Construct the full URL from `this.url` and the rendered path.
		// Adding the `.` turns the absolute path from `renderPath()` into a relative URL.
		// `requireURL()` resolves that path relative to `this.url`
		// Note that `requireURL()` rendering treats paths as folders, e.g. in `/a/b/c` the path will be relative to `c` not `b`
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

	// Override to set default functionality of a client provider to send requests over the network with `fetch()` and parse responses with `parseResponse()`.
	async fetch(request: Request): Promise<Response> {
		return fetch(request);
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
