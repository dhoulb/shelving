import type { ImmutableObject } from "../util/object.js";
import { getString } from "../util/string.js";
import { mapObject } from "../util/transform.js";

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
	/** String feedback message that is safe to show to a user. */
	readonly message: string;

	/** Nested details providing deeper feedback. */
	readonly details: ImmutableObject;

	constructor(feedback: string, details: ImmutableObject = {}) {
		this.message = feedback;
		this.details = details;
	}

	/**
	 * Map details to a set of string messages.
	 * - If a detail is another `Feedback` instance, return its `.message` string.
	 * - If a detail is anything else, convert it to string using `toString()`
	 */
	get messages(): ImmutableObject<string> {
		return mapObject(this.details, _getMessage);
	}
}
const _getMessage = (v: unknown): string => (isFeedback(v) ? v.message : getString(v));

/** Is an unknown value a `Feedback` instance? */
export const isFeedback = <T extends Feedback>(v: T | unknown): v is Feedback => v instanceof Feedback;
