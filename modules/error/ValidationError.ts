import { CodedError } from "./CodedError.js";

/** Error thrown when a value isn't valid. */
export class ValidationError extends CodedError {
	override readonly code = 422;
	constructor(message = "Invalid value", context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, ValidationError);
	}
}
ValidationError.prototype.name = "ValidationError";
