import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/**
 * Thrown when something is required but not supplied.
 * - Usually thrown from `requireX()` functions, e.g. `requireString()` and `requireNumber()`
 */
export class RequiredError extends BaseError {
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: RequiredError, ...options });
	}
}
RequiredError.prototype.name = "RequiredError";
