import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Options for `ResponseError`. */
interface ResponseErrorOptions extends BaseErrorOptions {
	/**
	 * HTTP status code for the response.
	 * @default 400
	 */
	readonly code?: number;
}

/**
 * Error thrown when a received HTTP response isn't OK.
 * - Carries the response's HTTP status `code` (defaults to `400`).
 *
 * @see https://shelving.cc/error/ResponseError
 */
export class ResponseError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/**
	 * HTTP status code for the response.
	 *
	 * @see https://shelving.cc/error/ResponseError/code
	 */
	readonly code: number;

	/** @param message Optional human-readable description of why the response was rejected. */
	constructor(message?: string, { code = 400, ...options }: ResponseErrorOptions = {}) {
		super(message, options);
		this.code = code;
		setBaseErrorOptions(ResponseError, this, options);
	}
}
ResponseError.prototype.name = "ResponseError";
