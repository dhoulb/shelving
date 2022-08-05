import { ImmutableObject, isObject } from "../util/object.js";
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
export interface Feedback {
	/** Name of the class (same as `Error`). */
	name: string;
}
export class Feedback {
	/** String feedback message that is safe to show to a user. */
	readonly message: string;

	/** Nested details providing deeper feedback. */
	readonly details: unknown;

	constructor(feedback: string, details?: unknown) {
		this.message = feedback;
		this.details = details;
	}
}
Feedback.prototype.name = "Feedback";

/** Is an unknown value a `Feedback` object. */
export const isFeedback = <T extends Feedback>(v: T | unknown): v is Feedback => isObject(v) && typeof v.name === "string" && v.name.endsWith("Feedback") && typeof v.message === "string";

/** Get an object of messages in `{ key: message }` format from a feedback's details property. */
export const getFeedbackMessages = ({ details }: Feedback): ImmutableObject<string> => (isObject(details) ? mapObject(details, _getMessage) : {});
const _getMessage = (v: unknown): string => (isFeedback(v) ? v.message : getString(v));
