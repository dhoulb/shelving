import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/** Provider that logs API operations to the console. */
export class DebugAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	override async fetch<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.fetch,
	): Promise<RR> {
		try {
			console.debug("⋯ FETCH", endpoint.method, endpoint.path, payload);
			const result = await super.fetch(endpoint, payload, options, caller);
			console.debug("↩ FETCH", endpoint.method, endpoint.path, result);
			return result;
		} catch (reason) {
			console.error("✘ FETCH", endpoint.method, endpoint.path, payload, reason);
			throw reason;
		}
	}
}
