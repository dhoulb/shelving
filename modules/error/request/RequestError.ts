/** Error thrown when a request isn't valid, includes a `code:` field to indicate the type of the request. */
export class RequestError extends Error {
	/** The corresponding HTTP status code for this error, in the range `400-499` */
	readonly code: number = 400;

	constructor(message = RequestError.prototype.message, options?: ErrorOptions) {
		super(message, options);
		Error.captureStackTrace(this, RequestError);
	}
}
RequestError.prototype.name = "RequestError";
RequestError.prototype.message = "Invalid request";
