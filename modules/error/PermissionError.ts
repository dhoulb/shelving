import type { ErrorCode } from "../util/error.js";
import { EnhancedError } from "./EnhancedError.js";

/** Thrown if an operation failed due to permissions. */
export class PermissionError extends EnhancedError {
	readonly code = "permission-denied" satisfies ErrorCode;
	constructor(message = "Permission denied", context?: unknown) {
		super(message, context);
	}
}
PermissionError.prototype.name = "PermissionError";
