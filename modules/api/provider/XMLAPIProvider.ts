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
 * @example
 * const provider = new XMLAPIProvider({ url: "https://api.example.com" });
 * const xml = await provider.call(getFeed, { id: "abc" });
 *
 * @see https://dhoulb.github.io/shelving/api/provider/XMLAPIProvider/XMLAPIProvider
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

	/**
	 * Parse a text `Response` for an endpoint.
	 * - Non-2xx responses become `ResponseError`.
	 * - The response body is always returned as raw text.
	 *
	 * @param _endpoint The endpoint the response was produced for.
	 * @param response The `Response` whose body is read as text.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns A promise resolving to the raw text result.
	 * @throws {ResponseError} if the response status is non-2xx.
	 * @example await provider.parseResponse(getFeed, response)
	 * @see https://dhoulb.github.io/shelving/api/provider/XMLAPIProvider/XMLAPIProvider/parseResponse
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
