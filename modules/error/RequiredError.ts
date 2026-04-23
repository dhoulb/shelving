import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/**
 * Thrown when something is required but not supplied.
 * - Usually thrown from `requireX()` functions, e.g. `requireString()` and `requireNumber()`
 */
export class RequiredError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(RequiredError, this, options);
	}
}
RequiredError.prototype.name = "RequiredError";
