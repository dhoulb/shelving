import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/**
 * Thrown when something is wrong or unexpected.
 * - Signals a logic or invariant failure that shouldn't normally happen, rather than a value or input problem.
 *
 * @example
 * 	throw new UnexpectedError("Should never reach here");
 * @see https://dhoulb.github.io/shelving/error/UnexpectedError/UnexpectedError
 */
export class UnexpectedError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/**
	 * Create a new `UnexpectedError`.
	 *
	 * @param message Optional human-readable description of the unexpected condition.
	 */
	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(UnexpectedError, this, options);
	}
}
UnexpectedError.prototype.name = "UnexpectedError";
