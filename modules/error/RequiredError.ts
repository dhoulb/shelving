import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/**
 * Thrown when something is required but not supplied.
 * - Usually thrown from `requireX()` functions, e.g. `requireString()` and `requireNumber()`.
 *
 * @see https://shelving.cc/error/RequiredError
 */
export class RequiredError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/** @param message Optional human-readable description of what was required but missing. */
	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(RequiredError, this, options);
	}
}
RequiredError.prototype.name = "RequiredError";
