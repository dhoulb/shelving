import { ResponseError } from "../../error/ResponseError.js";
import { getMessage } from "../../util/error.js";
import type { AnyCaller } from "../../util/function.js";
import { createJSONRequest, parseResponseJSON, type RequestBodyMethod, type RequestOptions } from "../../util/http.js";
import type { PossibleURL } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ClientAPIProvider } from "./ClientAPIProvider.js";

/**
 * Client API provider that always sends request bodies as JSON and parses responses as JSON.
 * - Forces JSON encoding regardless of the `Content-Type` the server returns.
 *
 * @see https://shelving.cc/api/JSONAPIProvider
 */
export class JSONAPIProvider<P = unknown, R = unknown> extends ClientAPIProvider<P, R> {
	protected override _createBodyRequest(
		method: RequestBodyMethod,
		url: PossibleURL,
		payload: P,
		options: RequestOptions,
		caller: AnyCaller,
	): Request {
		return createJSONRequest(method, url, payload, options, caller);
	}

	/** Parse the response body as JSON, even if the server omitted or mis-set the content type. */
	override async parseResponse<PP extends P, RR extends R>(
		_endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		const { ok, status } = response;
		const content = await parseResponseJSON(response, caller);
		if (!ok) throw new ResponseError(getMessage(content) ?? `Error ${status}`, { code: status, cause: response, caller });
		return content as RR;
	}
}
