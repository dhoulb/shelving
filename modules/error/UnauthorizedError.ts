import { EnhancedError } from "./EnhancedError.js";

/** Thrown if an operation failed because the user is logged in but does not have sufficient privileges to access something. */
export class UnauthorizedError extends EnhancedError {
	override readonly code = 401;
	constructor(message = "Unauthorized", context?: unknown) {
		super(message, context);
	}
}
UnauthorizedError.prototype.name = "UnauthorizedError";
