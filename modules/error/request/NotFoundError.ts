import { RequestError } from "./RequestError.js";

/** Thrown if if a value is required but doesn't exist. */
export class NotFoundError extends RequestError {
	override readonly code = 404;
	constructor(message = NotFoundError.prototype.message, options?: ErrorOptions) {
		super(message, options);
		Error.captureStackTrace(this, NotFoundError);
	}
}
NotFoundError.prototype.name = "NotFoundError";
NotFoundError.prototype.message = "Not found";
