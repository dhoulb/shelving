import { EnhancedError } from "./EnhancedError.js";

/** Error thrown when functionality is called but is not implemented by an interface. */
export class NotImplementedError extends EnhancedError {
	override readonly code = 501;
	constructor(message = "Not implemented", value?: unknown) {
		super(message, value);
	}
}
NotImplementedError.prototype.name = "NotImplementedError";
