import type { Start } from "../util/activity.js";
import { LazySet } from "../util/activity.js";
import { DeferredSequence } from "./DeferredSequence.js";
import { RegisteringSequence } from "./RegisteringSequence.js";

/** Deferred sequence of values that lazily calls a start function when it has iterators that are iterating, and stops the activity when all iterators are done. */
export class LazyDeferredSequence<T = void, R = void> extends DeferredSequence<T, R> {
	/** Store a list of iterators currently iterating over this iterable. */
	private readonly _iterators: Set<AsyncIterator<T>>;

	constructor(start: Start<DeferredSequence<T, R>>) {
		super();
		this._iterators = new LazySet(() => start(this));
	}

	// Implement `AsyncIterable`
	[Symbol.asyncIterator](): AsyncGenerator<T, R, void> {
		return new RegisteringSequence(this, this._iterators);
	}
}
