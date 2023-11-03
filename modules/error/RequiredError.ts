import type { ErrorCode } from "../util/error.js";
import { EnhancedError } from "./EnhancedError.js";

/** Thrown if e.g. a value is required but wasn't provided. */
export class RequiredError extends EnhancedError {
	readonly code = "not-found" satisfies ErrorCode;
	constructor(message = "Value is required", context?: unknown) {
		super(message, context);
	}
}
RequiredError.prototype.name = "RequiredError";
