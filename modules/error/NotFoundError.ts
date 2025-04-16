import { CodedError } from "./CodedError.js";

/** Thrown if if a value is required but doesn't exist. */
export class NotFoundError extends CodedError {
	override readonly code = 404;
	constructor(message = NotFoundError.prototype.message, context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, NotFoundError);
	}
}
NotFoundError.prototype.name = "NotFoundError";
NotFoundError.prototype.message = "Not found";
