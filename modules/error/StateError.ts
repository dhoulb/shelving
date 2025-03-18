import { EnhancedError } from "./EnhancedError.js";

/** Thrown if the state of the program is correct to execute a given operation. */
export class StateError extends EnhancedError {
	constructor(message = "Invalid state", context?: unknown) {
		super(message, context);
	}
}
StateError.prototype.name = "StateError";
