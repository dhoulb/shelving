import { setPrototype } from "../util/class.js";
import { ErrorFeedback } from "./ErrorFeedback.js";

/** Specific type of `ErrorFeedback` returned from `validate()` when a value is invalid. */
export class InvalidFeedback<T = unknown> extends ErrorFeedback<T> {
	@setPrototype("name", "InvalidFeedback") override readonly name!: string;
}
