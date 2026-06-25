import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/**
 * Thrown when a value is wrong or unexpected.
 * - Use for invalid runtime values; pass `received` / `expected` via `options` for context.
 *
 * @see https://shelving.cc/error/ValueError
 */
export class ValueError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/** @param message Optional human-readable description of why the value is wrong. */
	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(ValueError, this, options);
	}
}
ValueError.prototype.name = "ValueError";
