import { dispatchNext, getLastItem } from "../util/index.js";
import { Stream } from "./Stream.js";

/** Stream that only calls its most recently added subscriber. */
export class LastStream<T> extends Stream<T> {
	// Override to dispatch only to a slice of the subscribers.
	protected override _dispatch(value: T): void {
		const subscriber = getLastItem(this._subscribers);
		if (subscriber) dispatchNext(subscriber, value);
	}
}
