import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Options for `RequestError`. */
interface RequestErrorOptions extends BaseErrorOptions {
	readonly code?: number;
}

/**
 * Throw when a request isn't well-formed or is unacceptable in some way.
 * - Carries an HTTP-style `code` in the `400-499` client-error range (defaults to `400`).
 * - Base class for the specific request errors in this file (`UnauthorizedError`, `NotFoundError`, etc.).
 *
 * @example
 * 	throw new RequestError("Bad request", { code: 400 });
 * @see https://shelving.cc/error/RequestError
 */
export class RequestError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/**
	 * HTTP status code for this error in the range `400-499`, defaults to `400`.
	 *
	 * @see https://shelving.cc/error/RequestError/code
	 */
	readonly code: number;

	/**
	 * Create a new `RequestError`.
	 *
	 * @param message Optional human-readable description of why the request was rejected.
	 * @param options Optional options — `code` sets the HTTP status (defaults to `400`); `caller` and contextual fields are applied via `setBaseErrorOptions()`.
	 */
	constructor(message?: string, { code = 400, ...options }: RequestErrorOptions = {}) {
		super(message, options);
		this.code = code;
		setBaseErrorOptions(RequestError, this, options);
	}
}
RequestError.prototype.name = "RequestError";

/**
 * Throw if an operation failed because the user is not logged in, or the login information is not well-formed.
 * - Sets HTTP status `code` to `401`.
 *
 * @example
 * 	throw new UnauthorizedError("Please log in");
 * @see https://shelving.cc/error/UnauthorizedError
 */
export class UnauthorizedError extends RequestError {
	/**
	 * Create a new `UnauthorizedError` with HTTP status `401`.
	 *
	 * @param message Optional human-readable description of the authorization failure.
	 * @param options Optional options — `code` defaults to `401`; `caller` and contextual fields are applied via `setBaseErrorOptions()`.
	 */
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: UnauthorizedError, code: 401, ...options });
	}
}
UnauthorizedError.prototype.name = "UnauthorizedError";

/**
 * Throw if the requested content is not found.
 * - Sets HTTP status `code` to `404`.
 *
 * @example
 * 	throw new NotFoundError("User does not exist");
 * @see https://shelving.cc/error/NotFoundError
 */
export class NotFoundError extends RequestError {
	/**
	 * Create a new `NotFoundError` with HTTP status `404`.
	 *
	 * @param message Optional human-readable description of what was not found.
	 * @param options Optional options — `code` defaults to `404`; `caller` and contextual fields are applied via `setBaseErrorOptions()`.
	 */
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: NotFoundError, code: 404, ...options });
	}
}
NotFoundError.prototype.name = "NotFoundError";

/**
 * Throw when a request is valid and well-formed, but its actual data is not.
 * - Sets HTTP status `code` to `422`.
 *
 * @example
 * 	throw new UnprocessableError("Email address is invalid");
 * @see https://shelving.cc/error/UnprocessableError
 */
export class UnprocessableError extends RequestError {
	/**
	 * Create a new `UnprocessableError` with HTTP status `422`.
	 *
	 * @param message Optional human-readable description of why the data could not be processed.
	 * @param options Optional options — `code` defaults to `422`; `caller` and contextual fields are applied via `setBaseErrorOptions()`.
	 */
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: UnprocessableError, code: 422, ...options });
	}
}
UnprocessableError.prototype.name = "UnprocessableError";

/**
 * Throw if an operation failed because the user is logged in, but does not have sufficient privileges to access this content.
 * - Sets HTTP status `code` to `403`.
 *
 * @example
 * 	throw new ForbiddenError("Admins only");
 * @see https://shelving.cc/error/ForbiddenError
 */
export class ForbiddenError extends RequestError {
	/**
	 * Create a new `ForbiddenError` with HTTP status `403`.
	 *
	 * @param message Optional human-readable description of the privilege failure.
	 * @param options Optional options — `code` defaults to `403`; `caller` and contextual fields are applied via `setBaseErrorOptions()`.
	 */
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: ForbiddenError, code: 403, ...options });
	}
}
ForbiddenError.prototype.name = "ForbiddenError";

/**
 * Throw if a request uses an HTTP method that is not supported.
 * - Sets HTTP status `code` to `405`.
 *
 * @example
 * 	throw new MethodNotAllowedError("Use POST not GET");
 * @see https://shelving.cc/error/MethodNotAllowedError
 */
export class MethodNotAllowedError extends RequestError {
	/**
	 * Create a new `MethodNotAllowedError` with HTTP status `405`.
	 *
	 * @param message Optional human-readable description of the unsupported method.
	 * @param options Optional options — `code` defaults to `405`; `caller` and contextual fields are applied via `setBaseErrorOptions()`.
	 */
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: MethodNotAllowedError, code: 405, ...options });
	}
}
MethodNotAllowedError.prototype.name = "MethodNotAllowedError";
