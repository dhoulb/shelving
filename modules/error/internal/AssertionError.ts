import { InternalError } from "./InternalError.js";

/** Thrown if the program is in an unexpected state. */
export class AssertionError extends InternalError {
	constructor(message: string = AssertionError.prototype.message, context?: unknown) {
		super(message, context);
		Error.captureStackTrace(this, AssertionError);
	}
}
AssertionError.prototype.name = "AssertionError";
AssertionError.prototype.message = "Failed assertion";
