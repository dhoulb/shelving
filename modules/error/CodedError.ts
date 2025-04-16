import { debug } from "../util/debug.js";

/**
 * Error with a `.code` field and a `.details` field to provide context about what went wrong.
 * - Code should be a `number` in the range of 400-599
 * - Details are appended to `.message` in the format `message: debuggedContext`
 * - Details are converted to string using `debug()`
 */
export class CodedError extends Error {
	/** Number in the range of 400-599, roughly corresponding to HTTP error codes. */
	readonly code: number = 500;

	/** Details about the error, which are appended to the message. */
	readonly details: unknown;

	constructor(message = CodedError.prototype.message, details?: unknown) {
		const debugged = details !== undefined ? debug(details, 2) : "";
		super(debugged.length ? `${message}: ${debugged}` : message);
		this.details = details;
		Error.captureStackTrace(this, CodedError);
	}
}
CodedError.prototype.name = "CodedError";
CodedError.prototype.message = "Internal error";
