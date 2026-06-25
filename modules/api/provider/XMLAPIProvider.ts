import { ResponseError } from "../../error/ResponseError.js";
import type { Data } from "../../util/data.js";
import type { AnyCaller } from "../../util/function.js";
import { createXMLRequest, type RequestBodyMethod, type RequestOptions } from "../../util/http.js";
import type { PossibleURL } from "../../util/url.js";
import type { Endpoint } from "../endpoint/Endpoint.js";
import { ClientAPIProvider } from "./ClientAPIProvider.js";

/**
 * Client API provider that always sends request bodies as XML and parses responses as plain text.
 * - Request payloads must be data objects (serialised to XML); results are returned as raw text strings.
 *
 * @see https://shelving.cc/api/XMLAPIProvider
 */
export class XMLAPIProvider<P extends Data = Data, R extends string = string> extends ClientAPIProvider<P, R> {
	protected override _createBodyRequest(
		method: RequestBodyMethod,
		url: PossibleURL,
		payload: P,
		options: RequestOptions,
		caller: AnyCaller,
	): Request {
		return createXMLRequest(method, url, payload, options, caller);
	}

	/** Return the response body as raw text rather than parsing it. */
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
