import type { AnyCaller } from "../../util/function.js";
import type { RequestHandler, RequestOptions } from "../../util/http.js";
import type { AnyEndpoint, Endpoint } from "../endpoint/Endpoint.js";
import { ClientAPIProvider } from "./ClientAPIProvider.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/** A structured log entry emitted by `MockAPIProvider` for one of its provider operations. */
export type MockAPICall = {
	readonly type: "fetch";
	readonly endpoint: AnyEndpoint;
	readonly payload: unknown;
	readonly request: Request;
	readonly response: Response;
	readonly result: unknown;
};

/** Default handler just echoes back the input request as text. */
async function _passthroughHandler(request: Request): Promise<Response> {
	return new Response(await request.text());
}

/**
 * Provider that logs API calls without sending network requests.
 * - Extends `ThroughAPIProvider` to delegate request building and response parsing to a source `APIProvider`.
 * - The source provider's `fetch()` is never called — this provider intercepts all fetches and routes them through a `RequestHandler`.
 */
export class MockAPIProvider<P = unknown, R = unknown> extends ThroughAPIProvider<P, R> {
	readonly calls: MockAPICall[] = [];

	readonly handler: RequestHandler;

	constructor(
		handler: RequestHandler = _passthroughHandler,
		source: ClientAPIProvider<P, R> = new ClientAPIProvider({ url: "https://api.mock.com" }),
	) {
		super(source);
		this.handler = handler;
	}

	// Log a `fetch()` call without using the network.
	override async fetch<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options: RequestOptions = {},
		caller: AnyCaller = this.fetch,
	): Promise<RR> {
		const request = this.getRequest(endpoint, payload, options, caller);
		const response = await this.handler(request);
		const result = await this.parseResponse(endpoint, response, caller);
		this.calls.push({ type: "fetch", endpoint, payload, request, response, result });
		return result;
	}
}
