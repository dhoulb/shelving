import { CodedError } from "./CodedError.js";

/** Thrown if an operation failed because the user is logged in but does not have sufficient privileges to access something. */
export class ForbiddenError extends CodedError {
	override readonly code = 403;
	constructor(message = "Forbidden", context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, ForbiddenError);
	}
}
ForbiddenError.prototype.name = "ForbiddenError";
