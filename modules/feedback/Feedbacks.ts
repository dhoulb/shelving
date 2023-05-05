import type { ImmutableDictionary } from "../util/dictionary.js";
import { indent } from "../util/debug.js";
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
		super(`${Object.entries(feedbacks).map(_mapMessages).join("\n")}`, value);
		this.feedbacks = feedbacks;
	}
}

const _mapMessages = ([name, { message }]: readonly [string, Feedback]) => `${name}:${indent(message)}`;
