import { ResponseError } from "../../error/ResponseError.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestOptions } from "../../util/http.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/** Validate an asynchronous source provider (source can have any type because validation guarantees the type). */
export class ValidationAPIProvider extends ThroughAPIProvider {
	override async fetch<P, R>(endpoint: Endpoint<P, R>, payload: P, options?: RequestOptions, caller: AnyCaller = this.fetch): Promise<R> {
		// Validate payload — let thrown strings bubble up as user-readable messages for e.g. form handlers.
		const validPayload = _validatePayload(endpoint, payload);
		// Call through to source (raw transport, no schema validation).
		const content = await this.source.fetch(endpoint, validPayload, options, caller);
		// Validate result — wrap in ResponseError as this is a server/transport problem, not user error.
		return _validateResult(endpoint, content, caller);
	}
}

function _validatePayload<P, R>(endpoint: Endpoint<P, R>, payload: P): P {
	return endpoint.payload.validate(payload);
}

function _validateResult<P, R>(endpoint: Endpoint<P, R>, content: unknown, caller: AnyCaller): R {
	try {
		return endpoint.result.validate(content);
	} catch (thrown) {
		if (typeof thrown === "string") throw new ResponseError(`Invalid result for ${endpoint}:\n${thrown}`, { endpoint, code: 422, caller });
		throw thrown;
	}
}
