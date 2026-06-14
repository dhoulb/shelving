import { ANSI_FAILURE, ANSI_LEFT, ANSI_RIGHT, ANSI_SUCCESS, ANSI_WAITING } from "../../util/ansi.js";
import { debugFullRequest, debugFullResponse, debugRequest } from "../../util/debug.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/**
 * Provider that logs every request, response, and error to the console in detail to help diagnose issues in development.
 *
 * @example
 *  const api = new DebugAPIProvider(source);
 *  await api.call(endpoint, payload); // logs request, response, and result
 * @see https://dhoulb.github.io/shelving/api/provider/DebugAPIProvider/DebugAPIProvider
 */
export class DebugAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	/**
	 * Build a request via the source provider, logging the endpoint and payload (or any error).
	 *
	 * @param endpoint The endpoint to build a request for.
	 * @param payload The payload to send.
	 * @param options Optional request options.
	 * @param caller The calling function used for error stack traces.
	 * @returns The built request.
	 * @throws Rethrows any error thrown while building the request (after logging it).
	 * @example api.createRequest(endpoint, payload)
	 * @see https://dhoulb.github.io/shelving/api/provider/DebugAPIProvider/DebugAPIProvider/createRequest
	 */
	override createRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.createRequest,
	): Request {
		try {
			const request = super.createRequest(endpoint, payload, options, caller);
			console.debug(`${ANSI_WAITING} ${endpoint.toString()}`, payload);
			return request;
		} catch (reason) {
			console.error(`${ANSI_FAILURE} ${endpoint.toString()}`, payload, reason);
			throw reason;
		}
	}

	/**
	 * Fetch a request via the source provider, logging the full request and response (or any error).
	 *
	 * @param request The request to fetch.
	 * @returns Promise resolving to the response.
	 * @throws Rethrows any error thrown by the source provider (after logging it).
	 * @example await api.fetch(request)
	 * @see https://dhoulb.github.io/shelving/api/provider/DebugAPIProvider/DebugAPIProvider/fetch
	 */
	override async fetch(request: Request): Promise<Response> {
		try {
			console.debug(`${ANSI_RIGHT} ${await debugFullRequest(request)}`);
			const response = await super.fetch(request);
			console.debug(`${ANSI_LEFT} ${debugRequest(request)}\n\n${await debugFullResponse(response)}`);
			return response;
		} catch (reason) {
			console.error(`${ANSI_FAILURE} ${debugRequest(request)}`, reason);
			throw reason;
		}
	}

	/**
	 * Parse a response via the source provider, logging the parsed result (or any error).
	 *
	 * @param endpoint The endpoint the response came from.
	 * @param response The response to parse.
	 * @param caller The calling function used for error stack traces.
	 * @returns Promise resolving to the parsed result.
	 * @throws Rethrows any error thrown while parsing (after logging it).
	 * @example await api.parseResponse(endpoint, response)
	 * @see https://dhoulb.github.io/shelving/api/provider/DebugAPIProvider/DebugAPIProvider/parseResponse
	 */
	override async parseResponse<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		try {
			const result = await super.parseResponse(endpoint, response, caller);
			console.debug(`${ANSI_SUCCESS} ${endpoint.toString()}`, result);
			return result;
		} catch (reason) {
			console.error(`${ANSI_FAILURE} ${endpoint.toString()}`, reason);
			throw reason;
		}
	}
}
