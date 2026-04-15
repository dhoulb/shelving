import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { URL, URLString } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";

/** Provider for API endpoints rooted at a common base URL. */
export abstract class APIProvider<P = unknown, R = unknown> {
	/** The base URL for this API. */
	abstract readonly url: URLString;

	/**
	 * Render the full final URL for an API request to a given endpoint with a given payload.
	 * - Includes `?query` params if this is a `HEAD` or `GET` request.
	 *
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
	 */
	abstract renderURL<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP, caller?: AnyCaller): URL;

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
	abstract getRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller?: AnyCaller,
	): Request;

	/**
	 * Parse an HTTP `Response` for this endpoint.
	 * - Non-2xx responses become `ResponseError`.
	 * - Does not validate the result against the endpoint schema — use `ValidationAPIProvider` for that.
	 */
	abstract parseResponse<PP extends P, RR extends R>(_endpoint: Endpoint<PP, RR>, response: Response, caller?: AnyCaller): Promise<RR>;

	/** Send a payload to an `Endpoint` and retrieve the result. */
	async fetch<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller?: AnyCaller,
	): Promise<RR> {
		const request = this.getRequest(endpoint, payload, options, caller);
		const response = await fetch(request);
		return this.parseResponse(endpoint, response, caller);
	}
}
