import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/** Thrown when a value is wrong or unexpected. */
export class ValueError extends BaseError {
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: ValueError, ...options });
	}
}
ValueError.prototype.name = "ValueError";
ValueError.prototype.message = "Invalid value";
