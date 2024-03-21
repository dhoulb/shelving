import type { ImmutableDictionary } from "../util/dictionary.js";
import { Feedback } from "./Feedback.js";

/** Feedback with a set of named messages. */
export class Feedbacks extends Feedback {
	/** List of named messages. */
	readonly messages: ImmutableDictionary<string>;

	constructor(messages: ImmutableDictionary<string>, value?: unknown) {
		super("Multiple errors", value);
		this.messages = messages;
	}
}
