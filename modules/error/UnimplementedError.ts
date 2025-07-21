import { BaseError, type BaseErrorOptions } from "./BaseError.js";

/** Error thrown when functionality is called but is not implemented by an interface. */
export class UnimplementedError extends BaseError {
	constructor(message?: string, options?: BaseErrorOptions) {
		super(message, { caller: UnimplementedError, ...options });
	}
}
UnimplementedError.prototype.name = "UnimplementedError";
