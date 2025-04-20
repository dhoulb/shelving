/**
 * Basic errors.
 * - Indicate something is wrong with the program itself, not the user's request.
 * - Don;t be afraid to use the internal Javascript errors too like `TypeError`, `ReferenceError`, `RangeError` too.
 */
export * from "./AssertionError.js";
export * from "./UnimplementedError.js";
export * from "./NetworkError.js";

/**
 * Errors with a user's request (4xx errors).
 * These errors indicate an end-user/client has made a mistake and there is a problem with their request.
 */
export * from "./request/RequestError.js"; // 400
export * from "./request/UnauthorizedError.js"; // 401
export * from "./request/ForbiddenError.js"; // 403
export * from "./request/NotFoundError.js"; // 404
export * from "./request/InputError.js"; // 422
