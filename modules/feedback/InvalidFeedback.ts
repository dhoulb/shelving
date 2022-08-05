import { ErrorFeedback } from "./ErrorFeedback.js";

/** Specific type of `ErrorFeedback` returned from `validate()` when a value is invalid. */
export class InvalidFeedback extends ErrorFeedback {}
InvalidFeedback.prototype.name = "InvalidFeedback";
