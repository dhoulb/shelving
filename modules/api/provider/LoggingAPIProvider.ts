import type { Callback } from "../../util/function.js";
import { logRequest, logRequestError, logRequestResponse } from "../../util/log.js";
import type { APIProvider } from "./APIProvider.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/**
 * Provider that logs fetches to the console to keep useful request/response logs in production.
 * - Defaults to logging requests, responses, and errors via the `log` utilities; each can be overridden.
 *
 * @example
 *  const api = new LoggingAPIProvider(source);
 *  await api.fetch(request); // logs request and response
 * @see https://shelving.cc/api/LoggingAPIProvider
 */
export class LoggingAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	protected _logRequest: Callback<[Request]>;
	protected _logResponse: Callback<[Response, Request]>;
	protected _logError: Callback<[reason: unknown, Request]>;

	/**
	 * Create a logging provider wrapping a source provider.
	 *
	 * @param source The source provider whose fetches are logged.
	 * @param onRequest Called to log each outgoing request.
	 * @param onResponse Called to log each response.
	 * @param onError Called to log each error.
	 * @example new LoggingAPIProvider(source)
	 */
	constructor(
		source: APIProvider<P, R>,
		/** Log requests. */
		onRequest: Callback<[Request]> = logRequest,
		/** Log responses to requests. */
		onResponse: Callback<[Response, Request]> = logRequestResponse,
		/** Log errors for requests. */
		onError: Callback<[reason: unknown, Request]> = logRequestError,
	) {
		super(source);
		this._logRequest = onRequest;
		this._logResponse = onResponse;
		this._logError = onError;
	}

	/**
	 * Fetch a request through the source provider, logging the request, response, and any error.
	 *
	 * @param request The request to fetch.
	 * @returns Promise resolving to the response.
	 * @throws Rethrows any error thrown by the source provider (after logging it).
	 * @example await api.fetch(request)
	 * @see https://shelving.cc/api/LoggingAPIProvider/fetch
	 */
	override async fetch(request: Request): Promise<Response> {
		try {
			this._logRequest(request);
			const response = await super.fetch(request);
			this._logResponse(response, request);
			return response;
		} catch (reason) {
			this._logError(reason, request);
			throw reason;
		}
	}
}
