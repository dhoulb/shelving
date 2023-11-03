import type { ErrorCode } from "../util/error.js";
import { EnhancedError } from "./EnhancedError.js";

/** Error thrown when functionality is called but is not implemented by an interface. */
export class UnimplementedError extends EnhancedError {
	readonly code = "unimplemented" satisfies ErrorCode;
	constructor(message = "Not implemented", value?: unknown) {
		super(message, value);
	}
}
UnimplementedError.prototype.name = "UnimplementedError";
