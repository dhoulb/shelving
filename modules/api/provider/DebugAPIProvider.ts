import { debugFullRequest, debugFullResponse } from "../../util/debug.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/** Provider that logs API operations to the console. */
export class DebugAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	override async call<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.call,
	): Promise<RR> {
		// Turn the payload into a request and debug it before sending.
		let request: Request;
		try {
			request = this.getRequest(endpoint, payload, options, caller);
		} catch (reason) {
			console.error("✘ FETCH", this.url, endpoint.toString(), payload, reason);
			throw reason;
		}
		const debuggedRequest = await debugFullRequest(request);
		console.debug("… FETCH", this.url, endpoint.toString(), payload, debuggedRequest);

		// Fetch the response and debug if it throws.
		let response: Response;
		try {
			response = await this.fetch(request);
		} catch (reason) {
			console.error("✘ FETCH", this.url, endpoint.toString(), payload, debuggedRequest, reason);
			throw reason;
		}
		const debuggedResponse = await debugFullResponse(response);

		// Convert the  result or any parsing error.
		try {
			const result = await this.parseResponse(endpoint, response, caller);
			console.debug("✔ FETCH", this.url, endpoint.toString(), payload, debuggedRequest, debuggedResponse, result);
			return result;
		} catch (reason) {
			console.error("✘ FETCH", this.url, endpoint.toString(), payload, debuggedRequest, debuggedResponse, reason);
			throw reason;
		}
	}
}
