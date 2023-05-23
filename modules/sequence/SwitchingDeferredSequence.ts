import type { StartCallback } from "../util/callback.js";
import { SwitchingSet } from "../util/switch.js";
import { DeferredSequence } from "./DeferredSequence.js";
import { RegisteringSequence } from "./RegisteringSequence.js";

/** Deferred sequence of values that switches on when it has iterators that are iterating, and off when all iterators are done. */
export class SwitchingDeferredSequence<T = void, R = void> extends DeferredSequence<T, R> {
	/** Store a list of iterators currently iterating over this sequence. */
	private readonly _iterators: Set<AsyncIterator<T>>;

	constructor(start: StartCallback<DeferredSequence<T, R>>) {
		super();
		this._iterators = new SwitchingSet(() => start(this));
	}

	// Implement `AsyncIterable`
	[Symbol.asyncIterator](): AsyncGenerator<T, R, void> {
		return new RegisteringSequence(this, this._iterators);
	}
}
