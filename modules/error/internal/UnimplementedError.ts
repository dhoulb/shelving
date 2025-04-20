import { InternalError } from "./InternalError.js";

/** Error thrown when functionality is called but is not implemented by an interface. */
export class UnimplementedError extends InternalError {
	constructor(message = UnimplementedError.prototype.message, details?: unknown) {
		super(message, details);
		Error.captureStackTrace(this, UnimplementedError);
	}
}
UnimplementedError.prototype.name = "UnimplementedError";
UnimplementedError.prototype.message = "Not implemented";
