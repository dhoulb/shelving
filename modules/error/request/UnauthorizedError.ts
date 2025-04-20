import { RequestError } from "./RequestError.js";

/** Thrown if an operation failed because the user is logged in but does not have sufficient privileges to access something. */
export class UnauthorizedError extends RequestError {
	override readonly code: number = 401;
	constructor(message = UnauthorizedError.prototype.message, options?: ErrorOptions) {
		super(message, options);
		Error.captureStackTrace(this, UnauthorizedError);
	}
}
UnauthorizedError.prototype.name = "UnauthorizedError";
UnauthorizedError.prototype.message = "Unauthorized";
