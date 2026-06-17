import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/**
 * Error thrown when functionality is called but is not implemented by an interface.
 *
 * @example
 * 	throw new UnimplementedError("Not supported by this provider");
 * @see https://dhoulb.github.io/shelving/error/UnimplementedError/UnimplementedError
 */
export class UnimplementedError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/**
	 * Create a new `UnimplementedError`.
	 *
	 * @param message Optional human-readable description of the missing implementation.
	 */
	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(UnimplementedError, this, options);
	}
}
UnimplementedError.prototype.name = "UnimplementedError";
