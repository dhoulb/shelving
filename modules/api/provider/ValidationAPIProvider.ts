import { ResponseError } from "../../error/ResponseError.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/**
 * Provider that validates payloads and results against the endpoint's schemas, so a source of any type is made type-safe.
 * - Payload validation errors bubble up as user-readable strings; result validation errors are wrapped in [`ResponseError`](/error/ResponseError).
 *
 * @example
 *  const api = new ValidationAPIProvider(source);
 *  const result = await api.call(endpoint, payload); // validated payload and result
 * @see https://dhoulb.github.io/shelving/api/provider/ValidationAPIProvider/ValidationAPIProvider
 */
export class ValidationAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	/**
	 * Build a request via the source provider after validating the payload against the endpoint's payload schema.
	 *
	 * @param endpoint The endpoint to build a request for.
	 * @param payload The payload to validate and send.
	 * @param options Optional request options.
	 * @param caller The calling function used for error stack traces.
	 * @returns The built request.
	 * @throws {string} A user-readable validation message if the payload is invalid.
	 * @example api.createRequest(endpoint, payload)
	 * @see https://dhoulb.github.io/shelving/api/provider/ValidationAPIProvider/ValidationAPIProvider/createRequest
	 */
	override createRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.createRequest,
	): Request {
		// Validate payload — let thrown strings bubble up as user-readable messages for e.g. form handlers.
		return super.createRequest(endpoint, endpoint.payload.validate(payload), options, caller);
	}

	/**
	 * Parse a response via the source provider, then validate the result against the endpoint's result schema.
	 *
	 * @param endpoint The endpoint the response came from.
	 * @param response The response to parse and validate.
	 * @param caller The calling function used for error stack traces.
	 * @returns Promise resolving to the validated result.
	 * @throws {ResponseError} If the result fails validation (treated as a server/transport problem).
	 * @example await api.parseResponse(endpoint, response)
	 * @see https://dhoulb.github.io/shelving/api/provider/ValidationAPIProvider/ValidationAPIProvider/parseResponse
	 */
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
