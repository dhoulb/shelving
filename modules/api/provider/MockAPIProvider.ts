import { debugRequest } from "../../util/debug.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestHandler, RequestOptions } from "../../util/http.js";
import type { AnyEndpoint, Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "./APIProvider.js";
import { ClientAPIProvider } from "./ClientAPIProvider.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/**
 * Record of a single mocked fetch, pairing the request with the response the handler returned.
 * @see https://shelving.cc/api/MockAPIFetchCall
 */
export type MockAPIFetchCall = {
	readonly request: Request;
	readonly response: Response;
};

/**
 * Record of a single request build, capturing the endpoint, payload, options, and built request.
 * @see https://shelving.cc/api/MockAPIRequestCall
 */
export type MockAPIRequestCall = {
	readonly endpoint: AnyEndpoint;
	readonly payload: unknown;
	readonly options: RequestOptions | undefined;
	readonly request: Request;
};

/**
 * Record of a single response parse, capturing the endpoint, response, and parsed result.
 * @see https://shelving.cc/api/MockAPIResponseCall
 */
export type MockAPIResponseCall = {
	readonly endpoint: AnyEndpoint;
	readonly response: Response;
	readonly result: unknown;
};

/** Default handler just echoes back the input request as text. */
async function _mockHandler(request: Request): Promise<Response> {
	return new Response(`Mocked response to ${debugRequest(request)}`, { status: 200, statusText: "OK" });
}

/**
 * Provider that records API calls and serves them from a handler without sending network requests.
 * - Extends `ThroughAPIProvider` to delegate request building and response parsing to a source `APIProvider`.
 * - The source provider's `fetch()` is never called — this provider intercepts all fetches and routes them through a `RequestHandler`.
 * - Records `requestCalls`, `fetchCalls`, and `responseCalls` so tests can assert on what happened.
 *
 * @example
 *  const api = new MockAPIProvider();
 *  const result = await api.call(endpoint, payload);
 *  expect(api.fetchCalls).toHaveLength(1);
 * @see https://shelving.cc/api/MockAPIProvider
 */
export class MockAPIProvider<P = unknown, R = unknown> extends ThroughAPIProvider<P, R> {
	/**
	 * Records of every request built by this provider.
	 * @see https://shelving.cc/api/MockAPIProvider/requestCalls
	 */
	readonly requestCalls: MockAPIRequestCall[] = [];
	/**
	 * Records of every fetch handled by this provider.
	 * @see https://shelving.cc/api/MockAPIProvider/fetchCalls
	 */
	readonly fetchCalls: MockAPIFetchCall[] = [];
	/**
	 * Records of every response parsed by this provider.
	 * @see https://shelving.cc/api/MockAPIProvider/responseCalls
	 */
	readonly responseCalls: MockAPIResponseCall[] = [];

	/**
	 * The request handler that serves fetches in place of the network.
	 * @see https://shelving.cc/api/MockAPIProvider/handler
	 */
	readonly handler: RequestHandler;

	/**
	 * Create a mock provider that serves fetches from a handler.
	 *
	 * @param handler The handler that produces a response for each request (defaults to echoing the request).
	 * @param source The source provider used to build requests and parse responses.
	 * @example new MockAPIProvider()
	 */
	constructor(handler: RequestHandler = _mockHandler, source: APIProvider<P, R> = new ClientAPIProvider({ url: "https://api.mock.com" })) {
		super(source);
		this.handler = handler;
	}

	/**
	 * Build a request via the source provider, recording the endpoint and payload in `requestCalls`.
	 *
	 * @param endpoint The endpoint to build a request for.
	 * @param payload The payload to send.
	 * @param options Optional request options.
	 * @param caller The calling function used for error stack traces.
	 * @returns The built request.
	 * @example api.createRequest(endpoint, payload)
	 * @see https://shelving.cc/api/MockAPIProvider/createRequest
	 */
	override createRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.createRequest,
	): Request {
		const request = super.createRequest(endpoint, payload, options, caller);
		this.requestCalls.push({ endpoint, payload, options, request });
		return request;
	}

	/**
	 * Parse a response via the source provider, recording the response and result in `responseCalls`.
	 *
	 * @param endpoint The endpoint the response came from.
	 * @param response The response to parse.
	 * @param caller The calling function used for error stack traces.
	 * @returns Promise resolving to the parsed result.
	 * @example await api.parseResponse(endpoint, response)
	 * @see https://shelving.cc/api/MockAPIProvider/parseResponse
	 */
	override async parseResponse<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		const result = await super.parseResponse(endpoint, response, caller);
		this.responseCalls.push({ endpoint, response, result });
		return result;
	}

	/**
	 * Serve a request through the handler instead of the network, recording it in `fetchCalls`.
	 *
	 * @param request The request to handle.
	 * @returns Promise resolving to the handler's response.
	 * @example await api.fetch(request)
	 * @see https://shelving.cc/api/MockAPIProvider/fetch
	 */
	override async fetch(request: Request): Promise<Response> {
		const response = await this.handler(request);
		this.fetchCalls.push({ request, response });
		return response;
	}
}
