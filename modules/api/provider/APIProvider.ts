import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";

export abstract class APIProvider {
	/**
	 * Perform a fetch to an endpoint via this provider and validate the returned response against the endpoint result schema.
	 */
	abstract fetch<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller?: AnyCaller): Promise<R>;
}
