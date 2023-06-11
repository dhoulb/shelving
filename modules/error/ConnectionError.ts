import { AssertionError } from "./AssertionError.js";

/** Thrown if a user's internet connection fails. */
export class ConnectionError extends AssertionError {}
ConnectionError.prototype.name = "ConnectionError";
