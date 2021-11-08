import { Hydrations } from "./hydration.js";
import { debug, toString, ImmutableObject, MutableObject } from "./index.js";

/** Possible status strings for feedback. */
export type FeedbackStatus = "" | "success" | "warning" | "error" | "invalid";

/**
 * The `Feedback` class represents a feedback message that should be shown to the user.
 * - Basic `Feedback` is neither good nor bad, `SuccessFeedback` indicates good news, and `ErrorFeedback` indicates bad news.
 *
 * Conceptually different to a Javascript `Error`...
 * - `Error`: a program error designed to help developers fix an issue in their code.
 * - `Feedback`: generated in reaction to something a user did, and helps them understand what to do next.
 *
 * @param feedback String feedback message that is safe to show to users.
 * @param details Set of other `Feedback` instances describing the issue in further detail.
 */
export class Feedback {
	static STATUS: FeedbackStatus = "";

	/** Optional status string for this feedback. */
	readonly status: FeedbackStatus = (this.constructor as typeof Feedback).STATUS;

	/** String feedback message that is safe to show to a user. */
	readonly feedback: string;

	/** Nested details providing deeper feedback. */
	readonly details: ImmutableObject;

	constructor(feedback: string, details: ImmutableObject = {}) {
		this.feedback = feedback;
		this.details = details;
	}

	/**
	 * Map details to a set of string messages.
	 * - If a detail is another `Feedback` instance, return its feedback string.
	 * - If a detail is anything else, convert it to string using `toString()`
	 */
	get messages(): ImmutableObject<string> {
		const messages: MutableObject<string> = {};
		for (const [k, v] of Object.entries(this.details)) {
			if (v instanceof Feedback) messages[k] = v.feedback;
			else messages[k] = toString(v);
		}
		return messages;
	}

	/**
	 * Convert to string (equivalent to `message.details`).
	 * Returns a string including the main message string and a deeply nested list of child message strings.
	 *
	 * > Invalid format
	 * > - name: Invalid format
	 * >   - first: Must be string
	 * >     - value: 123
	 * >   - last: Must be string
	 * >     - value: true
	 * > - age: Must be number
	 * >   - value: "abc"
	 */
	toString(): string {
		let output = this.feedback;
		for (const [k, v] of Object.entries(this.details)) output += `\n- ${k}: ${isFeedback(v) ? v.toString().replace(/\n/g, "\n  ") : debug(v)}`;
		return output;
	}
}

/** Specific type of `Feedback` to indicate success (something went right!). */
export class SuccessFeedback extends Feedback {
	static override STATUS: FeedbackStatus = "success";
}

/** Specific type of `Feedback` to indicate warning (something might go wrong soon). */
export class WarningFeedback extends Feedback {
	static override STATUS: FeedbackStatus = "warning";
}

/** Specific type of `Feedback` to indicate an error (something went wrong). */
export class ErrorFeedback extends Feedback {
	static override STATUS: FeedbackStatus = "error";
}

/** Specific type of `ErrorFeedback` returned from `validate()` when a value is invalid. */
export class InvalidFeedback extends ErrorFeedback {
	static override STATUS: FeedbackStatus = "invalid";
}

/**
 * Is an unknown value a `Feedback` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `Schema`.
 */
export const isFeedback = <T extends Feedback>(v: T | unknown): v is T => v instanceof Feedback;

/** Set of hydrations for all feedback classes. */
export const FEEDBACK_HYDRATIONS = {
	success: SuccessFeedback,
	warning: WarningFeedback,
	invalid: InvalidFeedback,
	error: ErrorFeedback,
	feedback: Feedback,
};
FEEDBACK_HYDRATIONS as Hydrations;
