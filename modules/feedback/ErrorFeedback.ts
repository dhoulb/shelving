import { setPrototype } from "../util/class.js";
import { Feedback } from "./Feedback.js";

/** Specific type of `Feedback` to indicate an error (something went wrong). */
export class ErrorFeedback<T = unknown> extends Feedback<T> {
	@setPrototype("name", "ErrorFeedback") override readonly name!: string;
}
