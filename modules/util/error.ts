import type { Feedback } from "./feedback.js";
import { debug } from "./debug.js";

/**
 * Thrown if the program receives a value it didn't expect.
 *
 * @param message Message that explains why the thing happened.
 * @param ...received One or more additional details that appears in a ` (received X, Y, Z)` part of the message.
 */
export class AssertionError extends Error {
	constructor(message = "Failed assertion", ...received: unknown[]) {
		super(received.length ? `${message} (received ${received.map(debug).join(", ")})` : message);
	}
}
AssertionError.prototype.name = "AssertionError";

/** Thrown if a value is required but wasn't provided. */
export class RequiredError extends Error {
	constructor(message = "Value required") {
		super(message);
	}
}
RequiredError.prototype.name = "RequiredError";

/** Thrown if a value isn't valid. */
export class ValidationError extends Error {
	readonly feedback: Feedback;
	constructor(message: string, feedback: Feedback) {
		super(`${message}:\n${feedback.toString()}`);
		this.feedback = feedback;
	}
}
ValidationError.prototype.name = "ValidationError";

/** Thrown if a method isn't supported. */
export class UnsupportedError extends Error {
	constructor(message = "Method not supported") {
		super(message);
	}
}
UnsupportedError.prototype.name = "UnsupportedError";

/** Thrown if an operation failed due to permissions. */
export class PermissionError extends Error {
	constructor(message = "Permission denied") {
		super(message);
	}
}
PermissionError.prototype.name = "PermissionError";
