import { ResponseError } from "../../error/ResponseError.js";
import { getMessage } from "../../util/error.js";
import type { AnyCaller } from "../../util/function.js";
import { getJSONRequest, parseResponseJSON, type RequestBodyMethod, type RequestOptions } from "../../util/http.js";
import type { PossibleURL } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ClientAPIProvider } from "./ClientAPIProvider.js";

/** API provider that always sends request bodies as JSON and parses responses as JSON. */
export class JSONAPIProvider<P = unknown, R = unknown> extends ClientAPIProvider<P, R> {
	protected override _getBodyRequest(
		method: RequestBodyMethod,
		url: PossibleURL,
		payload: P,
		options: RequestOptions,
		caller: AnyCaller,
	): Request {
		return getJSONRequest(method, url, payload, options, caller);
	}

	/**
	 * Parse a JSON `Response` for an endpoint.
	 *
	 * - Non-2xx responses become `ResponseError`.
	 * - JSON is parsed even if the server omitted or mis-set the response content type.
	 */
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
