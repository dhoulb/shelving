import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Thrown when something is wrong or unexpected. */
export class UnexpectedError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	constructor(message?: string, options: BaseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(UnexpectedError, this, options);
	}
}
UnexpectedError.prototype.name = "UnexpectedError";
