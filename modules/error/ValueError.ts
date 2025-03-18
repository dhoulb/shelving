import { EnhancedError } from "./EnhancedError.js";

/** Error thrown when a value isn't valid. */
export class ValueError extends EnhancedError {
	constructor(message = "Invalid value", context?: unknown) {
		super(message, context);
	}
}
ValueError.prototype.name = "ValidationError";
