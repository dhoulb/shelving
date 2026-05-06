/** biome-ignore-all lint/suspicious/noConsole: This file's purpose is to write logs. */

import { ANSI_ICON_ERROR, ANSI_ICON_REQUEST, ANSI_ICON_RESPONSE } from "./ansi.js";
import { debug, debugFullRequest, debugFullResponse, debugRequest } from "./debug.js";

/** Log a `Request` */
export async function logRequest(request: Request) {
	console.log(`${ANSI_ICON_REQUEST} ${await debugFullRequest(request)}`);
}

/** Log a `Response` to a `Request` */
export async function logRequestResponse(response: Response, request: Request): Promise<void> {
	console.log(`${ANSI_ICON_RESPONSE} ${debugRequest(request)}\n\n${await debugFullResponse(response)}`);
}

/** Log an `Error` from a `Request` */
export function logRequestError(reason: unknown, request: Request): void {
	console.error(`${ANSI_ICON_ERROR} ${debugRequest(request)}\n\n${debug(reason)}`);
}
