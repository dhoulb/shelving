import type { Hydrations } from "../util/hydrate.js";
import { Feedback } from "./Feedback.js";
import { Feedbacks } from "./Feedbacks.js";

/** Set of hydrations for all feedback classes. */
export const FEEDBACK_HYDRATIONS: Hydrations = {
	Feedback,
	Feedbacks,
};
