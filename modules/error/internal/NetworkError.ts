import { InternalError } from "./InternalError.js";

/** Thrown in the event of network issues e.g. the user's internet connection is down, or the server is down. */
export class NetworkError extends InternalError {
	constructor(message = NetworkError.prototype.message, context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, NetworkError);
	}
}
NetworkError.prototype.name = "NetworkError";
NetworkError.prototype.message = "Network error";
