import type { ErrorCode } from "../util/error.js";
import { EnhancedError } from "./EnhancedError.js";

/** Thrown if the is in a state . */
export class AssertionError extends EnhancedError {
	readonly code: ErrorCode = "failed-precondition";
	constructor(message = "Failed precondition", context?: unknown) {
		super(message, context);
	}
}
AssertionError.prototype.name = "AssertionError";
