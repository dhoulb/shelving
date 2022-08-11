import { Feedback } from "./Feedback.js";

/** Specific type of `Feedback` to indicate an error (something went wrong). */
export class ErrorFeedback<T = unknown> extends Feedback<T> {}
(ErrorFeedback.prototype as { name: string }).name = "ErrorFeedback";
