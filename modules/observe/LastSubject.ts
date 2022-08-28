import { getOptionalLastItem } from "../util/array.js";
import { dispatchNext } from "./Observer.js";
import { Subject } from "./Subject.js";

/** Stream that only calls its most recently added subscriber. */
export class LastSubject<T> extends Subject<T> {
	// Override to dispatch only to a slice of the subscribers.
	protected override _dispatch(value: T): void {
		const observer = getOptionalLastItem(this.observers);
		if (observer) dispatchNext(observer, value);
	}
}
