/** Thrown if a method isn't supported. */
export class UnsupportedError extends Error {
	constructor(message = "Method not supported") {
		super(message);
	}
}
UnsupportedError.prototype.name = "UnsupportedError";
