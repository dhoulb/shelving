import type { ImmutableDictionary } from "../util/dictionary.js";
import { Feedback } from "./Feedback.js";

/** Feedback with a set of named messages. */
export class Feedbacks extends Feedback {
	/** List of named messages. */
	readonly messages: ImmutableDictionary<string>;

	constructor(messages: ImmutableDictionary<string>) {
		super("Multiple errors");
		this.messages = messages;
	}
}

/** Feedbacks with a known and typed `.value` field. */
export class ValueFeedbacks<T> extends Feedbacks {
	readonly value: T;
	constructor(messages: ImmutableDictionary<string>, value: T) {
		super(messages);
		this.value = value;
	}
}
