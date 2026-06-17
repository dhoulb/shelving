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
 * @example
 * const provider = new JSONAPIProvider({ url: "https://api.example.com" });
 * const user = await provider.call(getUser, { id: "abc" });
 *
 * @see https://dhoulb.github.io/shelving/api/provider/JSONAPIProvider/JSONAPIProvider
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

	/**
	 * Parse a JSON `Response` for an endpoint.
	 * - Non-2xx responses become [`ResponseError`](/error/ResponseError).
	 * - JSON is parsed even if the server omitted or mis-set the response content type.
	 *
	 * @param _endpoint The endpoint the response was produced for.
	 * @param response The `Response` to parse as JSON.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns A promise resolving to the parsed JSON result.
	 * @throws {ResponseError} if the response status is non-2xx.
	 * @example await provider.parseResponse(getUser, response)
	 * @see https://dhoulb.github.io/shelving/api/provider/JSONAPIProvider/JSONAPIProvider/parseResponse
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
