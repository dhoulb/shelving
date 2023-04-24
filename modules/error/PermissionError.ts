/** Thrown if an operation failed due to permissions. */
export class PermissionError extends Error {}
PermissionError.prototype.name = "PermissionError";
