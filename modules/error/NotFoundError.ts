import { EnhancedError } from "./EnhancedError.js";

/** Thrown if if a value is required but doesn't exist. */
export class NotFoundError extends EnhancedError {
	override readonly code = 404;
	constructor(message = "Not found", context?: unknown) {
		super(message, context);
	}
}
NotFoundError.prototype.name = "NotFoundError";
