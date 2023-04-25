import type { ImmutableDictionary } from "../util/dictionary.js";
import { mapDictionary } from "../util/transform.js";
import { Feedback, getFeedbackMessage } from "./Feedback.js";

/** Feedback with a list of sub-feedbacks. */
export class Feedbacks extends Feedback {
	/** List of sub-feedbacks. */
	readonly feedbacks: ImmutableDictionary<Feedback>;

	constructor(feedbacks: ImmutableDictionary<Feedback>, value?: unknown) {
		super("Invalid format", value);
		this.feedbacks = feedbacks;
	}
}

/** Get the messages from a feedbacks' sub-feedbacks. */
export const getFeedbackMessages = ({ feedbacks }: Feedbacks): ImmutableDictionary<string> => mapDictionary(feedbacks, getFeedbackMessage);
