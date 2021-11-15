/** Thrown if an operation failed due to permissions. */
export class PermissionError extends Error {
	constructor(message = "Permission denied") {
		super(message);
	}
}
PermissionError.prototype.name = "PermissionError";
