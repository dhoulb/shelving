/** PermissionError is thrown if if a value couldn't be retrieved due to a permission problem. */
export class PermissionError extends Error {
	constructor(message = "Permission denied") {
		super(message);
	}
}

PermissionError.prototype.name = "PermissionError";
