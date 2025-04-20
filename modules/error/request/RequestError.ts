import { debug } from "../../util/debug.js";

/** Error thrown when a request isn't valid, includes a `code:` field to indicate the type of the request. */
export class RequestError extends Error {
	/** The corresponding HTTP status code for this error, in the range `400-499` */
	readonly code: number = 400;

	/** Additional details about the error, which are appended to the message. */
	readonly details: unknown;

	constructor(message = RequestError.prototype.message, details?: unknown) {
		const debugged = details !== undefined ? debug(details, 2) : "";
		super(debugged.length ? `${message}: ${debugged}` : message);
		this.details = details;
		Error.captureStackTrace(this, RequestError);
	}
}
RequestError.prototype.name = "RequestError";
RequestError.prototype.message = "Invalid request";
