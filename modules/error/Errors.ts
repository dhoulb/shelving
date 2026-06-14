import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/**
 * Aggregate an array of errors into a single combined error.
 * - Extends (and shadows) the built-in `AggregateError` but with additional allowed options like `caller`.
 *
 * @example
 * 	throw new Errors([new ValueError("Bad name"), new ValueError("Bad age")], "Validation failed");
 * @see https://dhoulb.github.io/shelving/error/Errors/Errors
 */
export class Errors extends AggregateError implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/**
	 * Create a new `Errors` aggregate error.
	 *
	 * @param errors Iterable of the individual errors being aggregated.
	 * @param message Optional human-readable message describing the aggregate failure.
	 * @param options Optional `BaseErrorOptions` — `caller` and contextual fields are applied via `setBaseErrorOptions()`.
	 */
	constructor(errors: Iterable<unknown>, message?: string, options: BaseErrorOptions = {}) {
		super(errors, message, options);
		setBaseErrorOptions(Errors, this, options);
	}
}
Errors.prototype.name = "Errors";
