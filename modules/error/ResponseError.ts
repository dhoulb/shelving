import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/** Options for `ResponseError`. */
interface ResponseErrorOptions extends BaseErrorOptions {
	readonly code?: number;
}

/** Error thrown when a received HTTP response isn't OK. */
export class ResponseError extends BaseError {
	/** HTTP status code for the response. */
	readonly code: number;

	constructor(message: string = ResponseError.prototype.message, options?: ResponseErrorOptions) {
		super(message, { caller: ResponseError, ...options });
		this.code = options?.code ?? 400;
	}
}
ResponseError.prototype.name = "ResponseError";
