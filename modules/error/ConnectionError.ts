import { EnhancedError } from "./EnhancedError.js";

/** Thrown if e.g. a user's internet connection fails. */
export class ConnectionError extends EnhancedError {
	constructor(message = "Connection error", context?: unknown) {
		super(message, context);
	}
}
ConnectionError.prototype.name = "ConnectionError";
