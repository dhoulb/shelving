import type { Feedback } from "../feedback/Feedback.js";
import { debug } from "../util/debug.js";

/** Thrown if a value isn't valid. */
export class ValidationError extends Error {
	readonly feedback: Feedback;
	constructor(message: string, feedback: Feedback) {
		super(`${message}:\n${feedback.message} (received ${debug(feedback.value)})`);
		this.feedback = feedback;
	}
}
ValidationError.prototype.name = "ValidationError";
