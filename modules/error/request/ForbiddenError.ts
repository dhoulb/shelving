import { RequestError } from "./RequestError.js";

/** Thrown if an operation failed because the user is logged in but does not have sufficient privileges to access something. */
export class ForbiddenError extends RequestError {
	override readonly code: number = 403;
	constructor(message = ForbiddenError.prototype.message, context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, ForbiddenError);
	}
}
ForbiddenError.prototype.name = "ForbiddenError";
ForbiddenError.prototype.message = "Forbidden";
