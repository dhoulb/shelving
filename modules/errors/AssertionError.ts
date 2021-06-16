import { debug } from "../util";

/**
 * Thrown when the program receives a value it didn't expect.
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
