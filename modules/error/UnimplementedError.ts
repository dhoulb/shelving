/** Error thrown when functionality is called but is not implemented by an interface. */
export class UnimplementedError extends Error {
	constructor(message = UnimplementedError.prototype.message, options?: ErrorOptions) {
		super(message, options);
		Error.captureStackTrace(this, UnimplementedError);
	}
}
UnimplementedError.prototype.name = "UnimplementedError";
UnimplementedError.prototype.message = "Not implemented";
