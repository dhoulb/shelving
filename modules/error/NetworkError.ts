import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/** Thrown in the event of network issues e.g. the user's internet connection is down, or the server is down. */
export class NetworkError extends BaseError {
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: NetworkError, ...options });
	}
}
NetworkError.prototype.name = "NetworkError";
