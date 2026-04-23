import { type BaseError, type BaseErrorOptions, setBaseErrorOptions } from "./BaseError.js";

/** Options for `RequestError`. */
interface RequestErrorOptions extends BaseErrorOptions {
	readonly code?: number;
}

/** Throw when a request isn't well-formed or is unacceptable in some way. */
export class RequestError extends Error implements BaseError {
	/** Provide additional named contextual data that is relevant to the `Error` instance. */
	readonly [key: string]: unknown;

	/** HTTP status code for this error in the range `400-499`, defaults to `400` */
	readonly code: number;

	constructor(message?: string, { code = 400, ...options }: RequestErrorOptions = {}) {
		super(message, options);
		this.code = code;
		setBaseErrorOptions(RequestError, this, options);
	}
}
RequestError.prototype.name = "RequestError";

/** Throw if an operation failed because the user is not logged in, or the login information is not well-formed. */
export class UnauthorizedError extends RequestError {
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: UnauthorizedError, code: 401, ...options });
	}
}
UnauthorizedError.prototype.name = "UnauthorizedError";

/** Throw if the requested content is not found. */
export class NotFoundError extends RequestError {
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: NotFoundError, code: 404, ...options });
	}
}
NotFoundError.prototype.name = "NotFoundError";

/** Throw when a request is valid and well-formed, but its actual data is not. */
export class UnprocessableError extends RequestError {
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: UnprocessableError, code: 422, ...options });
	}
}
UnprocessableError.prototype.name = "UnprocessableError";

/** Throw if an operation failed because the user is logged in, but does not have sufficient privileges to access this content. */
export class ForbiddenError extends RequestError {
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: ForbiddenError, code: 403, ...options });
	}
}
ForbiddenError.prototype.name = "ForbiddenError";

/** Throw if a request uses an HTTP method that is not supported. */
export class MethodNotAllowedError extends RequestError {
	constructor(message?: string, options?: RequestErrorOptions) {
		super(message, { caller: MethodNotAllowedError, code: 405, ...options });
	}
}
MethodNotAllowedError.prototype.name = "MethodNotAllowedError";
