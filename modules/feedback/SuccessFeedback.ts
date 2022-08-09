import { Feedback } from "./Feedback.js";

/** Specific type of `Feedback` to indicate success (something went right!). */
export class SuccessFeedback<T = unknown> extends Feedback<T> {}
SuccessFeedback.prototype.name = "SuccessFeedback";
