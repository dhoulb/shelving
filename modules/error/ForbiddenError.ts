import { EnhancedError } from "./EnhancedError.js";

/** Thrown if an operation failed because the user is logged in but does not have sufficient privileges to access something. */
export class ForbiddenError extends EnhancedError {
	override readonly code = 403;
	constructor(message = "Forbidden", context?: unknown) {
		super(message, context);
	}
}
ForbiddenError.prototype.name = "ForbiddenError";
