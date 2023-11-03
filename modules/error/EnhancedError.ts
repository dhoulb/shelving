import { debug } from "../util/debug.js";

/**
 * Error with a `.context` field to provide information about what went wrong.
 * - Context is appended to `.message` in the format `message: debuggedContext`
 * - Context is converted to a string using `debug()`
 */
export class EnhancedError extends global.Error {
	readonly context: unknown;
	constructor(message: string, context?: unknown) {
		const debugged = context !== undefined ? debug(context, 2) : "";
		super(debugged.length ? `${message}: ${debugged}` : message);
		this.context = context;
	}
}
EnhancedError.prototype.name = "EnhancedError";
