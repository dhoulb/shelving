import type { AnyCaller } from "../../util/function.js";
import { mergeRequestOptions, type RequestHandler, type RequestOptions } from "../../util/http.js";
import type { AnyEndpoint, Endpoint } from "../endpoint/Endpoint.js";
import { ClientAPIProvider, type ClientAPIProviderOptions } from "./ClientAPIProvider.js";

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
 * Construction options for a `MockAPIProvider`.
 * - Accepts the normal `APIProvider` options.
 */
export interface MockAPIProviderOptions extends ClientAPIProviderOptions {
	/** Implement this handler to mock the the request/response input/output. */
	readonly handler: RequestHandler;
}

/** Provider that logs API calls without sending network requests. */
export class MockAPIProvider extends ClientAPIProvider {
	readonly calls: MockAPICall[] = [];

	readonly handler: RequestHandler;

	constructor({ handler, ...options }: MockAPIProviderOptions) {
		super(options);
		this.handler = handler;
	}

	/**
	 * Log a `fetch()` call without using the network.
	 * - If `getResult` is configured, its return value is validated against the endpoint result schema.
	 * - Otherwise `undefined` is validated against the endpoint result schema.
	 */
	override async fetch<P, R>(
		endpoint: Endpoint<P, R>,
		payload: P,
		_options: RequestOptions = {},
		caller: AnyCaller = this.fetch,
	): Promise<R> {
		const options = mergeRequestOptions(this.options, _options);
		const request = endpoint.getRequest(this.url, payload, options, caller);
		const response = await this.handler(request);
		const result = await endpoint.parseResponse(response);
		this.calls.push({ type: "fetch", endpoint, payload, options, request, response, result });
		return result;
	}
}
