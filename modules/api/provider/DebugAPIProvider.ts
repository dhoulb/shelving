import { debugFullRequest, debugFullResponse } from "../../util/debug.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/** Provider that logs operations to the console. */
export class DebugAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	override getRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.getRequest,
	): Request {
		const url = this.url.toString();
		const ep = endpoint.toString();
		try {
			const request = super.getRequest(endpoint, payload, options, caller);
			console.debug("✔ REQUEST", url, ep, payload);
			return request;
		} catch (reason) {
			console.error("✘ REQUEST", url, ep, payload, reason);
			throw reason;
		}
	}

	override async fetch(request: Request): Promise<Response> {
		const url = this.url.toString();
		try {
			console.debug("→ FETCH", url, await debugFullRequest(request));
			const response = await super.fetch(request);
			console.debug("← FETCH", url, await debugFullResponse(response));
			return response;
		} catch (reason) {
			console.error("✘ FETCH", url, reason);
			throw reason;
		}
	}

	override async parseResponse<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		const url = this.url.toString();
		const ep = endpoint.toString();
		try {
			const result = await super.parseResponse(endpoint, response, caller);
			console.debug("✔ RESPONSE", url, ep, result);
			return result;
		} catch (reason) {
			console.error("✘ RESPONSE", url, ep, reason);
			throw reason;
		}
	}
}
