import { CodedError } from "./CodedError.js";

/** Thrown if an operation failed because the user is logged in but does not have sufficient privileges to access something. */
export class UnauthorizedError extends CodedError {
	override readonly code = 401;
	constructor(message = "Unauthorized", context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, UnauthorizedError);
	}
}
UnauthorizedError.prototype.name = "UnauthorizedError";
