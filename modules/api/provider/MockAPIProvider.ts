import type { AnyCaller } from "../../util/function.js";
import { mergeRequestOptions, type RequestHandler, type RequestOptions } from "../../util/http.js";
import type { AnyEndpoint, Endpoint } from "../endpoint/Endpoint.js";
import { APIProvider } from "./APIProvider.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/** A structured log entry emitted by `MockAPIProvider` for one of its provider operations. */
export type MockAPICall = {
	readonly type: "fetch";
	readonly endpoint: AnyEndpoint;
	readonly options: RequestOptions;
	readonly payload: unknown;
	readonly request: Request;
	readonly response: Response;
	readonly result: unknown;
};

/**
 * Provider that logs API calls without sending network requests.
 * - Extends `ThroughAPIProvider` to delegate request building and response parsing to a source `APIProvider`.
 * - The source provider's `fetch()` is never called — this provider intercepts all fetches and routes them through a `RequestHandler`.
 */
export class MockAPIProvider extends ThroughAPIProvider {
	readonly calls: MockAPICall[] = [];

	readonly handler: RequestHandler;

	constructor(handler: RequestHandler, source: APIProvider = new APIProvider({ url: "https://api.mock.com" })) {
		super(source);
		this.handler = handler;
	}

	/**
	 * Log a `fetch()` call without using the network.
	 * - If `getResult` is configured, its return value is returned as-is (no schema validation).
	 * - Otherwise `undefined` is returned.
	 */
	override async fetch<P, R>(
		endpoint: Endpoint<P, R>,
		payload: P,
		_options: RequestOptions = {},
		caller: AnyCaller = this.fetch,
	): Promise<R> {
		const options = mergeRequestOptions(this.options, _options);
		const request = this.getRequest(endpoint, payload, options, caller);
		const response = await this.handler(request);
		const result = await this.parseResponse(endpoint, response, caller);
		this.calls.push({ type: "fetch", endpoint, payload, options, request, response, result });
		return result;
	}
}
