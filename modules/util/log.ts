/** biome-ignore-all lint/suspicious/noConsole: This file's purpose is to write logs. */

import { ANSI_FAILURE, ANSI_LEFT, ANSI_RIGHT } from "./ansi.js";
import { debug, debugFullRequest, debugFullResponse, debugRequest } from "./debug.js";

/** Log a `Request` */
export async function logRequest(request: Request) {
	console.log(`${ANSI_RIGHT} ${await debugFullRequest(request)}`);
}

/** Log a `Response` to a `Request` */
export async function logRequestResponse(response: Response, request: Request): Promise<void> {
	console.log(`${ANSI_LEFT} ${debugRequest(request)}\n\n${await debugFullResponse(response)}`);
}

/** Log an `Error` from a `Request` */
export function logRequestError(reason: unknown, request: Request): void {
	console.error(`${ANSI_FAILURE} ${debugRequest(request)}\n\n${debug(reason)}`);
}
