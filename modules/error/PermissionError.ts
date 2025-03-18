import { EnhancedError } from "./EnhancedError.js";

/** Thrown if an operation failed due to permissions. */
export class PermissionError extends EnhancedError {
	constructor(message = "Permission denied", context?: unknown) {
		super(message, context);
	}
}
PermissionError.prototype.name = "PermissionError";
