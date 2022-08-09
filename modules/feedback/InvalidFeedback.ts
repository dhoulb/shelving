import { ErrorFeedback } from "./ErrorFeedback.js";

/** Specific type of `ErrorFeedback` returned from `validate()` when a value is invalid. */
export class InvalidFeedback<T = unknown> extends ErrorFeedback<T> {}
InvalidFeedback.prototype.name = "InvalidFeedback";
