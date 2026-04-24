import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Options for `ResponseError`. */
interface ResponseErrorOptions extends BaseErrorOptions {
	readonly code?: number;
}

/** Error thrown when a received HTTP response isn't OK. */
export class ResponseError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/** HTTP status code for the response. */
	readonly code: number;

	constructor(message?: string, { code = 400, ...options }: ResponseErrorOptions = {}) {
		super(message, options);
		this.code = code;
		setBaseErrorOptions(ResponseError, this, options);
	}
}
ResponseError.prototype.name = "ResponseError";
