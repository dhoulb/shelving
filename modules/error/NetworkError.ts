/** Thrown in the event of network issues e.g. the user's internet connection is down, or the server is down. */
export class NetworkError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		Error.captureStackTrace(this, NetworkError);
	}
}
NetworkError.prototype.name = "NetworkError";
NetworkError.prototype.message = "Network error";
