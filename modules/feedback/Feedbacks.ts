import type { ImmutableDictionary } from "../util/dictionary.js";
import { getProp } from "../util/object.js";
import { mapDictionary } from "../util/transform.js";
import { Feedback } from "./Feedback.js";

/** Feedback with a list of sub-feedbacks. */
export class Feedbacks extends Feedback {
	/** List of sub-feedbacks. */
	readonly feedbacks: ImmutableDictionary<Feedback>;

	/** List of sub-messages. */
	get messages(): ImmutableDictionary<string> {
		return mapDictionary<Feedback, string, ["message"]>(this.feedbacks, getProp, "message");
	}

	constructor(feedbacks: ImmutableDictionary<Feedback>, value?: unknown) {
		super("Invalid format", value);
		this.feedbacks = feedbacks;
	}
}
