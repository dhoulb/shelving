import { ResponseError } from "../../error/ResponseError.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/**
 * Provider that validates payloads and results against the endpoint's schemas, so a source of any type is made type-safe.
 * - Payload validation errors bubble up as user-readable strings; result validation errors are wrapped in `ResponseError`.
 *
 * @see https://shelving.cc/api/ValidationAPIProvider
 */
export class ValidationAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	/** Validates `payload` against the endpoint's payload schema before delegating; an invalid payload throws a user-readable `string`. */
	override createRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.createRequest,
	): Request {
		// Validate payload — let thrown strings bubble up as user-readable messages for e.g. form handlers.
		return super.createRequest(endpoint, endpoint.payload.validate(payload), options, caller);
	}

	/** Validates the parsed result against the endpoint's result schema; a failed result is wrapped as a `ResponseError`. */
	override async parseResponse<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		try {
			// Validate result — wrap in ResponseError as this is a server/transport problem, not user error.
			return endpoint.result.validate(await super.parseResponse(endpoint, response, caller));
		} catch (thrown) {
			if (typeof thrown === "string")
				throw new ResponseError(`Invalid result for ${endpoint}:\n${thrown}`, { provider: this, endpoint, code: 422, caller });
			throw thrown;
		}
	}
}
