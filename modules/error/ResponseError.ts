import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/** Error thrown when an HTTP response isn't well-formed. */
export class ResponseError extends BaseError {
	constructor(message: string = ResponseError.prototype.message, options?: BaseErrorOptions) {
		super(message, { caller: ResponseError, ...options });
	}
}
ResponseError.prototype.name = "ResponseError";
ResponseError.prototype.message = "Invalid response";
