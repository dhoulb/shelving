import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Options for `ResponseError`. */
interface ResponseErrorOptions extends BaseErrorOptions {
	readonly code?: number;
}

/**
 * Error thrown when a received HTTP response isn't OK.
 * - Carries the response's HTTP status `code` (defaults to `400`).
 *
 * @example
 * 	throw new ResponseError("Unexpected response body", { code: 422 });
 * @see https://dhoulb.github.io/shelving/error/ResponseError/ResponseError
 */
export class ResponseError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/**
	 * HTTP status code for the response.
	 *
	 * @see https://dhoulb.github.io/shelving/error/ResponseError/ResponseError/code
	 */
	readonly code: number;

	/**
	 * Create a new `ResponseError`.
	 *
	 * @param message Optional human-readable description of why the response was rejected.
	 * @param options Optional options — `code` sets the HTTP status (defaults to `400`); `caller` and contextual fields are applied via `setBaseErrorOptions()`.
	 */
	constructor(message?: string, { code = 400, ...options }: ResponseErrorOptions = {}) {
		super(message, options);
		this.code = code;
		setBaseErrorOptions(ResponseError, this, options);
	}
}
ResponseError.prototype.name = "ResponseError";
