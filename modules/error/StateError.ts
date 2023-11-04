import type { ErrorCode } from "../util/error.js";
import { EnhancedError } from "./EnhancedError.js";

/** Thrown if the state of the program is correct to execute a given operation. */
export class StateError extends EnhancedError {
	readonly code: ErrorCode = "failed-precondition";
	constructor(message = "Failed precondition", context?: unknown) {
		super(message, context);
	}
}
StateError.prototype.name = "StateError";
