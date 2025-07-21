import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/** Error thrown when a request isn't well-formed. */
export class RequestError extends BaseError {
	/** The corresponding HTTP status code for this error, in the range `400-499` */
	readonly code: number = 400;

	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: RequestError, ...options });
	}
}
RequestError.prototype.name = "RequestError";

/** Thrown if an operation failed because the user is not logged in, or the login information is not well-formed. */
export class UnauthorizedError extends RequestError {
	override readonly code: number = 401;
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: UnauthorizedError, ...options });
	}
}
UnauthorizedError.prototype.name = "UnauthorizedError";

/** Thrown if the requested content is not found. */
export class NotFoundError extends RequestError {
	override readonly code: number = 404;
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: NotFoundError, ...options });
	}
}
NotFoundError.prototype.name = "NotFoundError";

/** Error thrown when a request is is valid and well-formed, but its actual data is not. */
export class UnprocessableError extends RequestError {
	override readonly code: number = 422;
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: UnprocessableError, ...options });
	}
}
UnprocessableError.prototype.name = "UnprocessableError";

/** Thrown if an operation failed because the user is logged in, but does not have sufficient privileges to access this content. */
export class ForbiddenError extends RequestError {
	override readonly code: number = 403;
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: ForbiddenError, ...options });
	}
}
ForbiddenError.prototype.name = "ForbiddenError";
