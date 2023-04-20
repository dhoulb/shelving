import { AssertionError } from "./AssertionError.js";

/** Thrown if a value is required but wasn't provided. */
export class RequiredError extends AssertionError {}
RequiredError.prototype.name = "RequiredError";
