import type { Callback } from "../../util/function.js";
import { logRequest, logRequestError, logRequestResponse } from "../../util/log.js";
import type { APIProvider } from "./APIProvider.js";
import { ThroughAPIProvider } from "./ThroughAPIProvider.js";

/**
 * Provider that logs fetches to the console to keep useful logs in production.
 * - Defaults to calling `console.log()` for requests/responses and
 */
export class LoggingAPIProvider<P, R> extends ThroughAPIProvider<P, R> {
	protected _logRequest: Callback<[Request]>;
	protected _logResponse: Callback<[Response, Request]>;
	protected _logError: Callback<[reason: unknown, Request]>;

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
