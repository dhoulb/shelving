import type { Feedback } from "./feedback.js";
import { debug } from "./debug.js";

/** Object that handles an error with its `error()` function. */
export interface Handlable {
	error(reason: Error | unknown): void;
}

/** Object that handles an error with its `error()` function, or a function that does the same. */
export type Handler = Handlable | ((reason: Error | unknown) => void);

/** Handle an error using a `Handler` */
export function handle(handler: Handler, reason: Error | unknown): void {
	try {
		if (typeof handler === "function") handler(reason);
		else if (handler.error) handler.error(reason);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Handle an error by logging it to the console. */
// eslint-disable-next-line no-console
export const logError = (reason: Error | unknown): void => void console.error(reason);

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
