import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Options for `ResponseError`. */
interface ResponseErrorOptions extends BaseErrorOptions {
	readonly code?: number;
}

/** Error thrown when a received HTTP response isn't OK. */
export class ResponseError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	constructor(message?: string, options: ResponseErrorOptions = {}) {
		super(message, options);
		setBaseErrorOptions(ResponseError, this, options);
	}
}
ResponseError.prototype.name = "ResponseError";
