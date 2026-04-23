import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/**
 * Aggregate an array of errors into a single combined error.
 * - Extends (and shadows) the built-in `AggregateError` but with additional allowed options like `caller`
 */
export class Errors extends AggregateError implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	constructor(errors: Iterable<unknown>, message?: string, options: BaseErrorOptions = {}) {
		super(errors, message, options);
		setBaseErrorOptions(Errors, this, options);
	}
}
Errors.prototype.name = "Errors";
