import type { ImmutableDictionary } from "../util/dictionary.js";
import { Entry, getEntries } from "../util/entry.js";
import { setPrototype } from "../util/class.js";
import { isObject } from "../util/object.js";
import { getString } from "../util/string.js";

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
export class Feedback<T = unknown> {
	/* Name of the type of feedback. */
	@setPrototype("name", "Feedback") readonly name!: string;

	/** String feedback message that is safe to show to a user. */
	readonly message: string;

	/** Nested details providing deeper feedback. */
	readonly value: T;

	constructor(feedback: string, value?: T);
	constructor(feedback: string, value: T) {
		this.message = feedback;
		this.value = value;
	}
}

/** Is an unknown value a `Feedback` object. */
export const isFeedback = <T extends Feedback>(v: T | unknown): v is Feedback => isObject(v) && typeof v.name === "string" && v.name.endsWith("Feedback") && typeof v.message === "string";

/**
 * Get an object of sub-messages in `{ key: message }` format from a feedback's value.
 * - Takes the `.value` property from a `Feedback` instance and looks for keyed `Feedback` instances in either `{ key: Feedback }`. `Feedback[]`, or `Map<key, Feedback>` formats.
 */
export const getFeedbackMessages = ({ value }: Feedback): ImmutableDictionary<string> => Object.fromEntries(_yieldFeedbackMessages(value));
function* _yieldFeedbackMessages(value: unknown): Iterable<Entry<string, string>> {
	if (isObject(value)) for (const [k, v] of getEntries(value)) if (isFeedback(v)) yield [getString(k), v.message];
}
