import { RequestError } from "./RequestError.js";

/** Error thrown when a request is is valid but its values are not. */
export class ValidationError extends RequestError {
	override readonly code: number = 422;
	constructor(message = ValidationError.prototype.message, context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, ValidationError);
	}
}
ValidationError.prototype.name = "ValidationError";
ValidationError.prototype.message = "Invalid input";
