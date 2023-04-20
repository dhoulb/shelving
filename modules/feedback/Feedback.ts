/**
 * The `Feedback` class represents a feedback message that should be shown to the user.
 * - Basic `Feedback` is neither good nor bad, `Feedback` indicates good news, and `Feedback` indicates bad news.
 *
 * Conceptually different to a Javascript `Error`...
 * - `Error`: a program error designed to help developers fix an issue in their code.
 * - `Feedback`: generated in reaction to something a user did, and helps them understand what to do next.
 */
export class Feedback {
	/** String feedback message that is safe to show to a user. */
	readonly message: string;

	/** Nested details providing deeper feedback. */
	readonly value: unknown;

	constructor(feedback: string, value?: unknown) {
		this.message = feedback;
		this.value = value;
	}

	toString() {
		return this.message;
	}
}

/** Is an unknown value a `Feedback` object. */
export const isFeedback = <T extends Feedback>(value: T | unknown): value is T => value instanceof Feedback;

/** Get the message from a feedback. */
export const getFeedbackMessage = ({ message }: Feedback): string => message;
