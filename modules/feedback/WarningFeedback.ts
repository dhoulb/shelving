import { Feedback } from "./Feedback.js";

/** Specific type of `Feedback` to indicate warning (something might go wrong soon). */
export class WarningFeedback<T = unknown> extends Feedback<T> {}
(WarningFeedback.prototype as { name: string }).name = "WarningFeedback";
