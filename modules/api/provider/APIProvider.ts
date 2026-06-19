import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";

/**
 * Abstract base for API providers that send requests to a set of `Endpoint` definitions rooted at a common base URL.
 * - Concrete subclasses implement `renderURL()`, `createRequest()`, `fetch()`, and `parseResponse()`; `call()` orchestrates them.
 * - Implements `AsyncDisposable` so providers can be wrapped and disposed in a chain.
 *
 * @example
 * const provider = new ClientAPIProvider({ url: "https://api.example.com" });
 * const user = await provider.call(getUser, { id: "abc" });
 *
 * @see https://dhoulb.github.io/shelving/api/provider/APIProvider/APIProvider
 */
export abstract class APIProvider<P = unknown, R = unknown> implements AsyncDisposable {
	/**
	 * The common base URL that every endpoint request is resolved against.
	 *
	 * @see https://dhoulb.github.io/shelving/api/provider/APIProvider/APIProvider/url
	 */
	abstract readonly url: URL;

	/**
	 * Render the full final URL for an API request to a given endpoint with a given payload.
	 * - Includes `?query` params if this is a `HEAD` or `GET` request.
	 *
	 * @param endpoint The endpoint whose path is rendered into the base URL.
	 * @param payload The payload supplying `{placeholder}` and query-param values.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The fully resolved request `URL`.
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
	 * @example provider.renderURL(getUser, { id: "abc" }) // URL("https://api.example.com/users/abc")
	 * @see https://dhoulb.github.io/shelving/api/provider/APIProvider/APIProvider/renderURL
	 */
	abstract renderURL<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP, caller?: AnyCaller): URL;

	/**
	 * Create a `Request` that targets this endpoint with a given base URL.
	 *
	 * @param endpoint The endpoint the request targets.
	 * @param payload The payload to embed into the `Request` to send to the endpoint.
	 * - Path `{placeholders}` are rendered from `payload`
	 * - For `GET` and `HEAD`, remaining `payload` fields are appended as `?query` params.
	 * - For all other requests, `payload` is sent as the body.
	 * @param options The `RequestOptions` to use when creating the `Request`, merged over the provider's own options.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The created `Request`, including any timeout `AbortSignal` configured on the provider.
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
	 * @example provider.createRequest(getUser, { id: "abc" })
	 * @see https://dhoulb.github.io/shelving/api/provider/APIProvider/APIProvider/createRequest
	 */
	abstract createRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller?: AnyCaller,
	): Request;

	/**
	 * Send a `Request` and return its `Response` (defaults to the JavaScript `fetch()` API).
	 *
	 * @param request The `Request` to send.
	 * @returns A promise resolving to the `Response`.
	 * @example const response = await provider.fetch(request);
	 * @see https://dhoulb.github.io/shelving/api/provider/APIProvider/APIProvider/fetch
	 */
	abstract fetch(request: Request): Promise<Response>;

	/**
	 * Parse an HTTP `Response` for this endpoint into a result value.
	 * - Non-2xx responses become `ResponseError`.
	 * - Does not validate the result against the endpoint schema — use `ValidationAPIProvider` for that.
	 *
	 * @param _endpoint The endpoint the response was produced for.
	 * @param response The `Response` to parse.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns A promise resolving to the parsed result.
	 * @throws {ResponseError} if the response status is non-2xx.
	 * @example const result = await provider.parseResponse(getUser, response);
	 * @see https://dhoulb.github.io/shelving/api/provider/APIProvider/APIProvider/parseResponse
	 */
	abstract parseResponse<PP extends P, RR extends R>(_endpoint: Endpoint<PP, RR>, response: Response, caller?: AnyCaller): Promise<RR>;

	/**
	 * Send a payload to an `Endpoint` and retrieve the parsed result.
	 * - Composes `createRequest()`, `fetch()`, and `parseResponse()` into a single round trip.
	 *
	 * @param endpoint The endpoint to call.
	 * @param payload The payload to send to the endpoint.
	 * @param options The `RequestOptions` to use, merged over the provider's own options.
	 * @param caller The function to attribute thrown errors to.
	 * @returns A promise resolving to the parsed result.
	 * @throws {ResponseError} if the response status is non-2xx.
	 * @example const user = await provider.call(getUser, { id: "abc" });
	 * @see https://dhoulb.github.io/shelving/api/provider/APIProvider/APIProvider/call
	 */
	async call<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller?: AnyCaller,
	): Promise<RR> {
		const request = this.createRequest(endpoint, payload, options, caller);
		const response = await this.fetch(request);
		return this.parseResponse(endpoint, response, caller);
	}

	// Implement `AsyncDisposable`
	async [Symbol.asyncDispose]() {
		// Empty by default.
	}
}
