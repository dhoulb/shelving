import { EnhancedError } from "./EnhancedError.js";

/** Error thrown when a value isn't valid. */
export class ValidationError extends EnhancedError {
	override readonly code = 422;
	constructor(message = "Invalid value", context?: unknown) {
		super(message, context);
	}
}
ValidationError.prototype.name = "ValidationError";
