import type { ErrorCode } from "../util/error.js";
import { EnhancedError } from "./EnhancedError.js";

/** Error thrown when a value isn't valid. */
export class ValueError extends EnhancedError {
	readonly code = "invalid-argument" satisfies ErrorCode;
	constructor(message = "Invalid value", context?: unknown) {
		super(message, context);
	}
}
ValueError.prototype.name = "ValidationError";
