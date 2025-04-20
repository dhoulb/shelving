import { debug } from "../../util/debug.js";

/**
 * Error with a `.details` field to provide context about what went wrong.
 * - Code should be a `number` in the range of 400-599
 * - Details are appended to `.message` in the format `message: debuggedContext`
 * - Details are converted to string using `debug()`
 */
export abstract class InternalError extends Error {
	/** Additional details about the error, which are appended to the message. */
	readonly details: unknown;

	constructor(message = InternalError.prototype.message, details?: unknown) {
		const debugged = details !== undefined ? debug(details, 2) : "";
		super(debugged.length ? `${message}: ${debugged}` : message);
		this.details = details;
	}
}
InternalError.prototype.name = "InternalError";
InternalError.prototype.message = "Internal error";
