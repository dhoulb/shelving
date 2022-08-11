import { setPrototype } from "../util/class.js";
import { Feedback } from "./Feedback.js";

/** Specific type of `Feedback` to indicate success (something went right!). */
export class SuccessFeedback<T = unknown> extends Feedback<T> {
	@setPrototype("name", "SuccessFeedback") override readonly name!: string;
}
