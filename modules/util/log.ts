/** biome-ignore-all lint/suspicious/noConsole: This file's purpose is to write logs. */

import { ANSI_FAILURE, ANSI_LEFT, ANSI_RIGHT } from "./ansi.js";
import { debug, debugFullRequest, debugFullResponse, debugRequest } from "./debug.js";

/**
 * Log a `Request` to the console.
 *
 * @param request The `Request` to log.
 * @returns A promise that resolves once the request has been logged.
 * @example await logRequest(request)
 * @see https://shelving.cc/util/log/logRequest
 */
export async function logRequest(request: Request) {
	console.log(`${ANSI_RIGHT} ${await debugFullRequest(request)}`);
}

/**
 * Log a `Response` to a `Request` to the console.
 *
 * @param response The `Response` to log.
 * @param request The originating `Request`, included in the log for context.
 * @returns A promise that resolves once the response has been logged.
 * @example await logRequestResponse(response, request)
 * @see https://shelving.cc/util/log/logRequestResponse
 */
export async function logRequestResponse(response: Response, request: Request): Promise<void> {
	console.log(`${ANSI_LEFT} ${debugRequest(request)}\n\n${await debugFullResponse(response)}`);
}

/**
 * Log an `Error` from a `Request` to the console.
 *
 * @param reason The error value to log.
 * @param request The originating `Request`, included in the log for context.
 * @returns Nothing.
 * @example logRequestError(error, request)
 * @see https://shelving.cc/util/log/logRequestError
 */
export function logRequestError(reason: unknown, request: Request): void {
	console.error(`${ANSI_FAILURE} ${debugRequest(request)}\n\n${debug(reason)}`);
}
