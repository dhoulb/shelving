import { awaitDispose } from "../../util/dispose.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Sourceable } from "../../util/source.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { APIProvider } from "./APIProvider.js";

/**
 * Provider wrapper that delegates every API operation to a wrapped `source` provider.
 * - Extend this when you want to intercept only selected API operations, such as injecting auth headers or logging.
 * - Implements [`Sourceable`](/util/source/Sourceable) so wrapped providers are discoverable via [`getSource()`](/util/source/getSource) / [`requireSource()`](/util/source/requireSource).
 *
 * @example
 * class AuthAPIProvider extends ThroughAPIProvider {
 * 	override createRequest(endpoint, payload, options, caller) {
 * 		return super.createRequest(endpoint, payload, { ...options, headers: { authorization: TOKEN } }, caller);
 * 	}
 * }
 *
 * @see https://dhoulb.github.io/shelving/api/provider/ThroughAPIProvider/ThroughAPIProvider
 */
export class ThroughAPIProvider<P, R> extends APIProvider<P, R> implements Sourceable<APIProvider<P, R>> {
	/**
	 * The base URL, delegated to the wrapped `source` provider.
	 *
	 * @see https://dhoulb.github.io/shelving/api/provider/ThroughAPIProvider/ThroughAPIProvider/url
	 */
	override get url(): URL {
		return this.source.url;
	}

	/**
	 * The wrapped source provider that operations delegate to.
	 *
	 * @see https://dhoulb.github.io/shelving/api/provider/ThroughAPIProvider/ThroughAPIProvider/source
	 */
	readonly source: APIProvider<P, R>;

	/**
	 * Wrap a source `APIProvider`.
	 *
	 * @param source The provider that every operation delegates to.
	 * @example new ThroughAPIProvider(clientProvider)
	 * @see https://dhoulb.github.io/shelving/api/provider/ThroughAPIProvider/ThroughAPIProvider
	 */
	constructor(source: APIProvider<P, R>) {
		super();
		this.source = source;
	}

	/**
	 * Render the request URL by delegating to the source provider.
	 *
	 * @param endpoint The endpoint whose path is rendered into the base URL.
	 * @param payload The payload supplying `{placeholder}` and query-param values.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The fully resolved request `URL`.
	 * @example provider.renderURL(getUser, { id: "abc" })
	 * @see https://dhoulb.github.io/shelving/api/provider/ThroughAPIProvider/ThroughAPIProvider/renderURL
	 */
	override renderURL<PP extends P, RR extends R>(endpoint: Endpoint<PP, RR>, payload: PP, caller: AnyCaller = this.renderURL): URL {
		return this.source.renderURL(endpoint, payload, caller);
	}

	/**
	 * Create the request by delegating to the source provider.
	 *
	 * @param endpoint The endpoint the request targets.
	 * @param payload The payload to embed into the `Request`.
	 * @param options The [`RequestOptions`](/util/http/RequestOptions) to use, merged over the provider's own options.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The created `Request`.
	 * @example provider.createRequest(getUser, { id: "abc" })
	 * @see https://dhoulb.github.io/shelving/api/provider/ThroughAPIProvider/ThroughAPIProvider/createRequest
	 */
	override createRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.createRequest,
	): Request {
		return this.source.createRequest(endpoint, payload, options, caller);
	}

	/**
	 * Parse the response by delegating to the source provider.
	 *
	 * @param endpoint The endpoint the response was produced for.
	 * @param response The `Response` to parse.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns A promise resolving to the parsed result.
	 * @example await provider.parseResponse(getUser, response)
	 * @see https://dhoulb.github.io/shelving/api/provider/ThroughAPIProvider/ThroughAPIProvider/parseResponse
	 */
	override parseResponse<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		return this.source.parseResponse(endpoint, response, caller);
	}

	/**
	 * Send the request by delegating to the source provider.
	 *
	 * @param request The `Request` to send.
	 * @returns A promise resolving to the `Response`.
	 * @example await provider.fetch(request)
	 * @see https://dhoulb.github.io/shelving/api/provider/ThroughAPIProvider/ThroughAPIProvider/fetch
	 */
	override fetch(request: Request): Promise<Response> {
		return this.source.fetch(request);
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose]() {
		await awaitDispose(
			this.source, // Dispose the source API provider.
		);
	}
}
