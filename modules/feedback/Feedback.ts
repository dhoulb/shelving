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

	constructor(message: string) {
		this.message = message;
	}

	toString() {
		return this.message;
	}
}

/** Feedback with a known and typed `.value` field. */
export class ValueFeedback<T> extends Feedback {
	readonly value: T;
	constructor(message: string, value: T) {
		super(message);
		this.value = value;
	}
}
