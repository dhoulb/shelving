import { EnhancedError } from "./EnhancedError.js";

/** Thrown if the state of the program is not correct to execute a given operation. */
export class ConflictError extends EnhancedError {
	override readonly code = 509;
	constructor(message = "Conflict", context?: unknown) {
		super(message, context);
	}
}
ConflictError.prototype.name = "ConflictError";
