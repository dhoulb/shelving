import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Error thrown when functionality is called but is not implemented by an interface. */
export class UnimplementedError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(UnimplementedError, this, options);
	}
}
UnimplementedError.prototype.name = "UnimplementedError";
