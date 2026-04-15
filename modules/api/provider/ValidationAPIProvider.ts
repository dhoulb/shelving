import { ResponseError } from "../../error/ResponseError.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/** Validate an asynchronous source provider (source can have any type because validation guarantees the type). */
export class ValidationAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	override getRequest<PP extends P, RR extends R>(
		endpoint: Endpoint<PP, RR>,
		payload: PP,
		options?: RequestOptions,
		caller: AnyCaller = this.getRequest,
	): Request {
		// Validate payload — let thrown strings bubble up as user-readable messages for e.g. form handlers.
		return super.getRequest(endpoint, endpoint.payload.validate(payload), options, caller);
	}

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
