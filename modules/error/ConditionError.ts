/**
 * Thrown if the program is in a condition it shouldn't have reached.
 * e.g. writing to a stream that's already closed
 */
export class ConditionError extends Error {
	constructor(message = "Invalid condition") {
		super(message);
	}
}
ConditionError.prototype.name = "ConditionError";
