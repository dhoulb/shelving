import { AssertionError } from "./AssertionError.js";

/**
 * Thrown if the program is in a condition it shouldn't have reached.
 * e.g. writing to a stream that's already closed
 */
export class ConditionError extends AssertionError {}
ConditionError.prototype.name = "ConditionError";
