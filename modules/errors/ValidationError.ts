import type { Feedback } from "../feedback";

/** Thrown if a value isn't valid. */
export class ValidationError extends Error {
	feedback: Feedback;
	value: unknown;
	constructor(message: string, feedback: Feedback, value: unknown) {
		super(`${message}:\n${feedback.toString()}`);
		this.feedback = feedback;
		this.value = value;
	}
}
ValidationError.prototype.name = "ValidationError";
