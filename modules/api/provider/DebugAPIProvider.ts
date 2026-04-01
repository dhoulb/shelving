import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/** Provider that logs API operations to the console. */
export class DebugAPIProvider extends ThroughAPIProvider {
	override async fetch<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller: AnyCaller = this.fetch): Promise<R> {
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
