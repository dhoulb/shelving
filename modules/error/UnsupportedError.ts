import { AssertionError } from "./AssertionError.js";

/** Thrown if a method isn't supported. */
export class UnsupportedError extends AssertionError {}
UnsupportedError.prototype.name = "UnsupportedError";
