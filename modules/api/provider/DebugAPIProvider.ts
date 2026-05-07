import { ANSI_FAILURE, ANSI_LEFT, ANSI_RIGHT, ANSI_SUCCESS, ANSI_WAITING } from "../../util/ansi.js";
import { debugFullRequest, debugFullResponse, debugRequest } from "../../util/debug.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/** Provider that logs everything to the console in some detail to help diagnose issues in development. */
export class DebugAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	override getRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.getRequest,
	): Request {
		try {
			const request = super.getRequest(endpoint, payload, options, caller);
			console.debug(`${ANSI_WAITING} ${endpoint.toString()}`, payload);
			return request;
		} catch (reason) {
			console.error(`${ANSI_FAILURE} ${endpoint.toString()}`, payload, reason);
			throw reason;
		}
	}

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
