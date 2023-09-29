import type { Disposable } from "../util/dispose.js";
import { type Start, Starter } from "../util/start.js";
import { DeferredSequence } from "./DeferredSequence.js";
import { IteratorSequence } from "./IteratorSequence.js";

/** Deferred sequence of values that calls a `StartCallback` when it has iterators that are iterating, and calls the corresponding `StopCallback` when all iterators have finished. */
export class LazyDeferredSequence<T = void> extends DeferredSequence<T> implements Disposable {
	private _iterating = 0;
	private _starter: Starter<[DeferredSequence<T>]>;
	constructor(start: Start<[DeferredSequence<T>]>) {
		super();
		this._starter = new Starter(start);
	}
	override async *[Symbol.asyncIterator](): AsyncGenerator<T, void, void> {
		this._starter.start(this);
		this._iterating++;
		try {
			// Delegate to the superclass's async iterator.
			// Wrap in an `IteratorSequence` because we know the superclass `AbstractSequence.prototype.[Symbol.asyncIterator]()` simply returns `this`
			// `yield* this` would call this method again and cause an infinite loop.
			yield* new IteratorSequence<T>(super[Symbol.asyncIterator]());
		} finally {
			this._iterating--;
			if (this._iterating < 1) this._starter.stop();
		}
	}
	[Symbol.dispose](): void {
		this._starter[Symbol.dispose]();
	}
}
