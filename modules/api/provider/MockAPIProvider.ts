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
 * Construction options for a `MockAPIProvider`
 * - Same as options for a normal `ClientAPIProvider`, but with an optional URL.
 */
export interface MockAPIProviderOptions extends Omit<ClientAPIProviderOptions, "url"> {
	/** Optional URL, defaults to `"https://api.mock.com"` */
	url?: ClientAPIProviderOptions["url"];
}

/** Provider that logs API calls without sending network requests. */
export class MockAPIProvider extends ClientAPIProvider {
	readonly calls: MockAPICall[] = [];

	readonly handler: RequestHandler;

	constructor(handler: RequestHandler, { url = "https://api.mock.com", ...options }: MockAPIProviderOptions = {}) {
		super({ url, ...options });
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
