import { CodedError } from "./CodedError.js";

/** Thrown if e.g. a user's internet connection fails. */
export class ConnectionError extends CodedError {
	constructor(message = ConnectionError.prototype.message, context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, ConnectionError);
	}
}
ConnectionError.prototype.name = "ConnectionError";
ConnectionError.prototype.message = "Connection error";
