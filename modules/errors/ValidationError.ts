import type { Feedback } from "../feedback";

/** Thrown if a value isn't valid. */
export class ValidationError extends Error {
	feedback: Feedback;
	constructor(message: string, feedback: Feedback) {
		super(`${message}:\n${feedback.toString()}`);
		this.feedback = feedback;
	}
}
ValidationError.prototype.name = "ValidationError";
