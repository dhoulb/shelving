import { ResponseError } from "../../error/ResponseError.js";
import { isData } from "../../util/data.js";
import { getMessage } from "../../util/error.js";
import type { AnyCaller } from "../../util/function.js";
import {
	assertRequestHeadPayload,
	createHeadRequest,
	createRequest,
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

/**
 * Options for constructing a `ClientAPIProvider`.
 *
 * @see https://shelving.cc/api/ClientAPIProviderOptions
 */
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
	 * Options used for HTTP requests created with `this.createRequest()` and `this.fetch()`
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
 * - Extendable with custom request-building and response-parsing logic by overriding `createRequest()` and `parseResponse()`.
 * - Wrap in `ValidationAPIProvider` to add automatic validation of request payloads and response results against endpoint schemas.
 *
 * @example
 * const provider = new ClientAPIProvider({ url: "https://api.example.com" });
 * const user = await provider.call(getUser, { id: "abc" });
 *
 * @see https://shelving.cc/api/ClientAPIProvider
 */
export class ClientAPIProvider<P = unknown, R = unknown> extends APIProvider<P, R> {
	/**
	 * The common base URL for all rendered endpoint requests.
	 *
	 * @see https://shelving.cc/api/ClientAPIProvider/url
	 */
	override readonly url: URL;

	/**
	 * Default options used for HTTP requests created with `this.createRequest()` and `this.fetch()`
	 *
	 * @see https://shelving.cc/api/ClientAPIProvider/options
	 */
	readonly options: RequestOptions;

	/**
	 * Timeout in milliseconds before the request is aborted, or `0` for no timeout.
	 *
	 * @see https://shelving.cc/api/ClientAPIProvider/timeout
	 */
	readonly timeout: number;

	/**
	 * Create a `ClientAPIProvider` from a base URL and request options.
	 *
	 * @throws {RequiredError} if `url` cannot be resolved to a valid base URL.
	 * @example new ClientAPIProvider({ url: "https://api.example.com" })
	 * @see https://shelving.cc/api/ClientAPIProvider
	 */
	constructor({ url, options = {}, timeout = 20_000 }: ClientAPIProviderOptions) {
		super();
		this.url = requireBaseURL(url, ClientAPIProvider);
		this.options = options;
		this.timeout = timeout;
	}

	/**
	 * Render the full request URL, appending `?query` params for `HEAD` and `GET` requests.
	 *
	 * @param endpoint The endpoint whose path is rendered into the base URL.
	 * @param payload The payload supplying `{placeholder}` and query-param values.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The fully resolved request `URL`.
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
	 * @example provider.renderURL(getUser, { id: "abc" })
	 * @see https://shelving.cc/api/ClientAPIProvider/renderURL
	 */
	override renderURL<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP, caller: AnyCaller = this.renderURL): URL {
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

	/**
	 * Create a `Request` for an endpoint, rendering payload into the URL or body depending on the method.
	 * - `HEAD` and `GET` requests carry their payload as `?query` params; other methods carry it as the body.
	 * - Merges `options` over the provider's default options and attaches a timeout `AbortSignal` when `timeout` is set.
	 *
	 * @param endpoint The endpoint the request targets.
	 * @param payload The payload to embed into the `Request`.
	 * @param options Per-call `RequestOptions` merged over the provider's defaults.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The created `Request`.
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
	 * @example provider.createRequest(getUser, { id: "abc" })
	 * @see https://shelving.cc/api/ClientAPIProvider/createRequest
	 */
	override createRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.createRequest,
	): Request {
		// Render the path into the base URL.
		const url = this.renderURL(endpoint, payload, caller);

		// Merge the param options with `this.options`
		// If we have a timeout set, create an `AbortSignal` for it.
		const signal = this.timeout ? AbortSignal.timeout(this.timeout) : null;
		const mergedOptions = mergeRequestOptions({ signal, ...this.options }, options);

		// HEAD or GET requests need no payload because it was already rendered into the URL as `?query` params by `this.renderURL()`
		if (isRequestHeadMethod(endpoint.method)) return this._createHeadRequest(endpoint.method, url, undefined, mergedOptions, caller);

		// Body request.
		const body: P = isData(payload) ? (omitProps(payload, ...endpoint.placeholders) as P) : payload; // Omit any params that have already been embedded as `{placeholders}`.
		return this._createBodyRequest(endpoint.method, url, body, mergedOptions, caller);
	}

	/** Internal implementation function for `createRequest()` used for requests that have no body. */
	protected _createHeadRequest(
		method: RequestHeadMethod, //
		url: PossibleURL,
		params: Nullish<PossibleURIParams>,
		options: RequestOptions,
		caller: AnyCaller,
	): Request {
		return createHeadRequest(method, url, params, options, caller);
	}

	/** Internal implementation function for `createRequest()` used for requests that have a body.  */
	protected _createBodyRequest(
		method: RequestBodyMethod, //
		url: PossibleURL,
		payload: P,
		options: RequestOptions,
		caller: AnyCaller,
	): Request {
		return createRequest(method, url, payload, options, caller);
	}

	/**
	 * Send the request over the network using the global `fetch()` API.
	 *
	 * @param request The `Request` to send.
	 * @returns A promise resolving to the `Response`.
	 * @example await provider.fetch(request)
	 * @see https://shelving.cc/api/ClientAPIProvider/fetch
	 */
	override async fetch(request: Request): Promise<Response> {
		return fetch(request);
	}

	/**
	 * Parse a response body into a result, throwing `ResponseError` for non-2xx responses.
	 *
	 * @param _endpoint The endpoint the response was produced for.
	 * @param response The `Response` to parse.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns A promise resolving to the parsed result.
	 * @throws {ResponseError} if the response status is non-2xx.
	 * @example await provider.parseResponse(getUser, response)
	 * @see https://shelving.cc/api/ClientAPIProvider/parseResponse
	 */
	override async parseResponse<PP extends P, RR extends R>(
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
