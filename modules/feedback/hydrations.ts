import type { Hydrations } from "../util/hydrate.js";
import { Feedback } from "./Feedback.js";
import { SuccessFeedback } from "./SuccessFeedback.js";
import { WarningFeedback } from "./WarningFeedback.js";
import { ErrorFeedback } from "./ErrorFeedback.js";
import { InvalidFeedback } from "./InvalidFeedback.js";

/** Set of hydrations for all feedback classes. */
export const FEEDBACK_HYDRATIONS: Hydrations = {
	SuccessFeedback,
	WarningFeedback,
	InvalidFeedback,
	ErrorFeedback,
	Feedback,
};
