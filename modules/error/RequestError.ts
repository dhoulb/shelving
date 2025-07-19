import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/** Options for a `RequestError` */
interface RequestErrorOptions extends BaseErrorOptions {
	code?: number;
}

/** Error thrown when a request isn't well-formed. */
export class RequestError extends BaseError {
	/** The corresponding HTTP status code for this error, in the range `400-499` */
	code: number;

	constructor(message: string = RequestError.prototype.message, options?: RequestErrorOptions) {
		super(message, { caller: RequestError, ...options });
		this.code = options?.code || 400;
	}
}
RequestError.prototype.name = "RequestError";
RequestError.prototype.message = "Invalid request";

/** Thrown if an operation failed because the user is not logged in, or the login information is not well-formed. */
export class UnauthorizedError extends RequestError {
	override readonly code: number = 401;
	constructor(message = UnauthorizedError.prototype.message, options?: RequestErrorOptions) {
		super(message, { caller: UnauthorizedError, code: 401, ...options });
	}
}
UnauthorizedError.prototype.name = "UnauthorizedError";
UnauthorizedError.prototype.message = "Authorization is required";

/** Thrown if the requested content is not found. */
export class NotFoundError extends RequestError {
	override readonly code = 404;
	constructor(message = NotFoundError.prototype.message, options?: RequestErrorOptions) {
		super(message, { caller: NotFoundError, code: 404, ...options });
	}
}
NotFoundError.prototype.name = "NotFoundError";
NotFoundError.prototype.message = "Cannot find requested content";

/** Error thrown when a request is is valid and well-formed, but its actual data is not. */
export class UnprocessableError extends RequestError {
	override readonly code: number = 422;
	constructor(message = UnprocessableError.prototype.message, options?: RequestErrorOptions) {
		super(message, { caller: UnprocessableError, code: 422, ...options });
	}
}
UnprocessableError.prototype.name = "UnprocessableError";
UnprocessableError.prototype.message = "Input data is invalid";

/** Thrown if an operation failed because the user is logged in, but does not have sufficient privileges to access this content. */
export class ForbiddenError extends RequestError {
	override readonly code: number = 403;
	constructor(message = ForbiddenError.prototype.message, options?: RequestErrorOptions) {
		super(message, { caller: ForbiddenError, code: 403, ...options });
	}
}
ForbiddenError.prototype.name = "ForbiddenError";
ForbiddenError.prototype.message = "Insufficient privileges to access this content";
