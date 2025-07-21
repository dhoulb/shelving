import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/** Thrown when something is wrong or unexpected. */
export class UnexpectedError extends BaseError {
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: UnexpectedError, ...options });
	}
}
UnexpectedError.prototype.name = "UnexpectedError";
