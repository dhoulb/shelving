import { Feedback } from "./Feedback.js";

/** Throw the value if it's an instance of `Feedback` */
export function throwFeedback<T>(value: T | Feedback): T {
	if (value instanceof Feedback) throw value;
	return value;
}
