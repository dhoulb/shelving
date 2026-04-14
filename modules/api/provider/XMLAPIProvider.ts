import { ResponseError } from "../../error/ResponseError.js";
import type { Data } from "../../util/data.js";
import type { AnyCaller } from "../../util/function.js";
import { getXMLRequest, type RequestBodyMethod, type RequestOptions } from "../../util/http.js";
import type { PossibleURL } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ClientAPIProvider } from "./ClientAPIProvider.js";

/** API provider that always sends request bodies as XML and parses responses as plain text. */
export class XMLAPIProvider<P extends Data = Data, R = string> extends ClientAPIProvider<P, R> {
	protected override _getBodyRequest(
		method: RequestBodyMethod,
		url: PossibleURL,
		payload: P,
		options: RequestOptions,
		caller: AnyCaller,
	): Request {
		return getXMLRequest(method, url, payload, options, caller);
	}

	/**
	 * Parse a text `Response` for an endpoint.
	 *
	 * - Non-2xx responses become `ResponseError`.
	 * - The response body is always returned as raw text.
	 */
	override async parseResponse<PP extends P, RR extends R>(
		_endpoint: Endpoint<PP, RR>,
		response: Response,
		caller: AnyCaller = this.parseResponse,
	): Promise<RR> {
		const { ok, status } = response;
		const content = await response.text();
		if (!ok) throw new ResponseError(content || `Error ${status}`, { code: status, cause: response, caller });
		return content as RR;
	}
}
