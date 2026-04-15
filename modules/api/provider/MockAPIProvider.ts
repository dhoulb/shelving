import { debugRequest } from "../../util/debug.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestHandler, RequestOptions } from "../../util/http.js";
import type { AnyEndpoint, Endpoint } from "../endpoint/Endpoint.js";
import type { APIProvider } from "./APIProvider.js";
import { ClientAPIProvider } from "./ClientAPIProvider.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

export type MockAPIFetchCall = {
	readonly request: Request;
	readonly response: Response;
};

export type MockAPIRequestCall = {
	readonly endpoint: AnyEndpoint;
	readonly payload: unknown;
	readonly options: RequestOptions | undefined;
	readonly request: Request;
};

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
 * Provider that logs API calls without sending network requests.
 * - Extends `ThroughAPIProvider` to delegate request building and response parsing to a source `APIProvider`.
 * - The source provider's `fetch()` is never called — this provider intercepts all fetches and routes them through a `RequestHandler`.
 */
export class MockAPIProvider<P = unknown, R = unknown> extends ThroughAPIProvider<P, R> {
	readonly requestCalls: MockAPIRequestCall[] = [];
	readonly fetchCalls: MockAPIFetchCall[] = [];
	readonly responseCalls: MockAPIResponseCall[] = [];

	readonly handler: RequestHandler;

	constructor(handler: RequestHandler = _mockHandler, source: APIProvider<P, R> = new ClientAPIProvider({ url: "https://api.mock.com" })) {
		super(source);
		this.handler = handler;
	}

	// Override `getRequest()` to log the endpoint and payload before delegating to the source provider for request building.
	override getRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.getRequest,
	): Request {
		const request = super.getRequest(endpoint, payload, options, caller);
		this.requestCalls.push({ endpoint, payload, options, request });
		return request;
	}

	// Override `parseResponse()` to log the response and result.
	override async parseResponse<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		const result = await super.parseResponse(endpoint, response, caller);
		this.responseCalls.push({ endpoint, response, result });
		return result;
	}

	// Override `fetch()` to route through the handler instead of the network.
	override async fetch(request: Request): Promise<Response> {
		const response = await this.handler(request);
		this.fetchCalls.push({ request, response });
		return response;
	}
}
