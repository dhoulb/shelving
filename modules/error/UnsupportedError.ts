import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/**
 * Error thrown when functionality is called but is not supported — by a backend, an environment, or an implementation.
 *
 * @see https://shelving.cc/error/UnsupportedError
 */
export class UnsupportedError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/** @param message Optional human-readable description of the unsupported functionality. */
	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(UnsupportedError, this, options);
	}
}
UnsupportedError.prototype.name = "UnsupportedError";
