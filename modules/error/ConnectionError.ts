import { CodedError } from "./CodedError.js";

/** Thrown if e.g. a user's internet connection fails. */
export class ConnectionError extends CodedError {
	constructor(message = "Connection error", context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, ConnectionError);
	}
}
ConnectionError.prototype.name = "ConnectionError";
