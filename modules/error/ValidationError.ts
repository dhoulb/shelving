import { AssertionError } from "./AssertionError.js";

/** Thrown if a value isn't valid. */
export class ValidationError extends AssertionError {}
ValidationError.prototype.name = "ValidationError";
