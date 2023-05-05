import { debug, indent } from "../util/debug.js";

/**
 * Thrown if the program receives a value it didn't expect.
 *
 * @param message Message that explains why the thing happened.
 * @param received The value that made the assertion fail.
 * @param expected The value that made the assertion fail.
 */
export class AssertionError extends Error {
	readonly received: unknown;
	readonly expected: unknown;
	constructor(message = "Failed assertion", ...receivedExpected: readonly [received?: unknown, expected?: unknown]) {
		super(
			receivedExpected.length >= 2 //
				? `${message}\nReceived:${indent(debug(receivedExpected[0]))}\nExpected:${indent(debug(receivedExpected[0]))}`
				: receivedExpected.length >= 1
				? `${message}\nReceived:${indent(debug(receivedExpected[0]))}`
				: message,
		);
		this.received = receivedExpected[0];
		this.expected = receivedExpected[1];
	}
}
AssertionError.prototype.name = "AssertionError";
