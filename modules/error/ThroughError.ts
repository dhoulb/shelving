import { debug } from "../util/debug.js";

/**
 * Thrown to wrap an error with another error.
 * - Merges the message and stack of the previous message.
 */
export class ThroughError extends Error {
	constructor(message: string, cause: unknown) {
		super(message);
		this.cause = cause;
		this.stack = `${this.stack || ""}\nCause: ${cause instanceof Error ? cause.stack || "" : debug(cause)}`;
	}
}
ThroughError.prototype.name = "ThroughError";
