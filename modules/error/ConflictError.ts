import { CodedError } from "./CodedError.js";

/** Thrown if the state of the program is not correct to execute a given operation. */
export class ConflictError extends CodedError {
	override readonly code = 509;
	constructor(message = ConflictError.prototype.message, context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, ConflictError);
	}
}
ConflictError.prototype.name = "ConflictError";
ConflictError.prototype.message = "Conflict";
