import { CodedError } from "./CodedError.js";

/** Error thrown when functionality is called but is not implemented by an interface. */
export class NotImplementedError extends CodedError {
	override readonly code = 501;
	constructor(message = NotImplementedError.prototype.message, value?: unknown) {
		super(message, value);
		Error.captureStackTrace(this, NotImplementedError);
	}
}
NotImplementedError.prototype.name = "NotImplementedError";
NotImplementedError.prototype.message = "Not implemented";
