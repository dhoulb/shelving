/** Thrown if an operation failed due to permissions. */
export class AssertionError extends Error {}
AssertionError.prototype.name = "PermissionError";
