import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/**
 * Thrown when a value is we're asserting something to be true, but it isn't.
 * - Usually thrown from `assertX()` functions, e.g. `assertString()` and `assertNumber()`
 */
export class AssertionError extends BaseError {
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: AssertionError, ...options });
	}
}
AssertionError.prototype.name = "AssertionError";
AssertionError.prototype.message = "Assertion failed";
