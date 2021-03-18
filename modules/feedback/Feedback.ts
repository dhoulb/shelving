import { ImmutableObject, mapProps, isObject } from "../object";

const entryToString = ([key, feedback]: [string, Feedback]) => `- ${key}: ${feedback.toString().replace(/\n/g, "\n  ")}`;
const messageToString = (feedback: Feedback) => feedback.message;

/** Possible status strings for feedback. */
export type FeedbackStatus = "success" | "warning" | "error" | "invalid";

/** Format we convert messages to in JSON. */
type FeedbackJSON = {
	readonly status?: FeedbackStatus;
	readonly message: string;
	readonly details?: ImmutableObject<FeedbackJSON>;
};

/**
 * The `Feedback` class represents a message that should be shown to the user.
 * - Basic message is neither good nor bad — should be extended to indicate a more-specific status.
 * - `.status` string can be set to a `FeedbackStatus` type that represents the status of the message.
 *
 * Conceptually different to a Javascript `Error`...
 * - `Error`: a program error designed to help developers fix an issue in their code.
 * - `Feedback`: generated in reaction to something a user did, and helps them understand what to do next.
 *
 * @param message String message that is safe to show to users.
 * @param details Set of other `Feedback` instances describing the issue in further detail.
 */
export class Feedback implements FeedbackJSON {
	/** Optional status string for this feedback. */
	readonly status?: FeedbackStatus;

	/** String feedback message that is safe to show to a user. */
	readonly message: string;

	/** Nested sub-feedback instances providing deeper feedback. */
	readonly details?: ImmutableObject<Feedback>;

	constructor(message: string, details?: ImmutableObject<Feedback>) {
		this.message = message;
		this.details = details;
	}

	/** Convert the children of this `Feedback` into an object in `{ name: message }` format. */
	get messages(): ImmutableObject<string> | undefined {
		return this.details && mapProps(this.details, messageToString);
	}

	/**
	 * Convert to string (equivalent to `message.details`).
	 * Returns a string including the main message string and a deeply nested array of child message strings.
	 *
	 * > Invalid format
	 * > - name: Invalid format
	 * >   - first: Must be string
	 * >   - last: Must be string
	 * > - age: Must be number
	 */
	toString(): string {
		const messages = this.details ? Object.entries(this.details).map(entryToString).join("\n") : "";
		return `${this.message}${messages ? `\n${messages}` : ""}`;
	}

	/** Create a Feedback from its corresponding JSON format. */
	static fromJSON(json: unknown): Feedback {
		// If it's a string try to parse it as JSON.
		const obj = typeof json === "string" ? JSON.parse(json) : json;

		// See if it's an object now.
		if (isFeedbackJSON(obj)) {
			const { status, message, details: unhydratedDetails } = obj;
			const details = unhydratedDetails ? mapProps(unhydratedDetails, Feedback.fromJSON) : undefined;

			// If this status is a registered type, create the correct new class.
			switch (status) {
				case "success":
					return new SuccessFeedback(message, details);
				case "warning":
					return new WarningFeedback(message, details);
				case "error":
					return new ErrorFeedback(message, details);
				case "invalid":
					return new InvalidFeedback(message, details);
				case undefined:
					return new Feedback(message, details);
			}
		}

		// Anything else is impossible.
		throw new SyntaxError("Feedback.fromJSON(): Incorrect JSON format");
	}
}

/** Specific type of `Feedback` to indicate success (something went right!). */
export class SuccessFeedback extends Feedback {
	readonly status: FeedbackStatus = "success";
}

/** Specific type of `Feedback` to indicate warning (something might go wrong soon). */
export class WarningFeedback extends Feedback {
	readonly status: FeedbackStatus = "warning";
}

/** Specific type of `Feedback` to indicate an error (something went wrong). */
export class ErrorFeedback extends Feedback {
	readonly status: FeedbackStatus = "error";
}

/** Specific type of `Feedback` returned from `validate()` when a value is invalid. */
export class InvalidFeedback extends ErrorFeedback {
	readonly status: FeedbackStatus = "invalid";
}

/**
 * Is an unknown value a `Feedback` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `Schema`.
 */
export const isFeedback = <T extends Feedback>(v: T | unknown): v is T => v instanceof Feedback;

/**
 * Is an unknown value a `FeedbackJSON` instance?
 */
export const isFeedbackJSON = (v: unknown): v is FeedbackJSON =>
	isObject(v) && typeof v.message === "string" && (v.details === undefined || isObject(v.details));
