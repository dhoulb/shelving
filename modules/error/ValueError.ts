import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/**
 * Thrown when a value is wrong or unexpected.
 * - Use for invalid runtime values; pass `received` / `expected` via `options` for context.
 *
 * @example
 * 	throw new ValueError("Must be a positive number", { received: -1 });
 * @see https://dhoulb.github.io/shelving/error/ValueError/ValueError
 */
export class ValueError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/**
	 * Create a new `ValueError`.
	 *
	 * @param message Optional human-readable description of why the value is wrong.
	 * @param options Optional `BaseErrorOptions` — `caller` and contextual fields are applied via `setBaseErrorOptions()`.
	 */
	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(ValueError, this, options);
	}
}
ValueError.prototype.name = "ValueError";
