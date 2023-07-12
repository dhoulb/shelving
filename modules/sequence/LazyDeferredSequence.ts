import type { StartCallback, StopCallback } from "../util/callback.js";
import { call } from "../util/callback.js";
import { DeferredSequence } from "./DeferredSequence.js";

/** Deferred sequence of values that calls a `StartCallback` when it has iterators that are iterating, and calls the corresponding `StopCallback` when all iterators have finished. */
export class LazyDeferredSequence<T = void> extends DeferredSequence<T> {
	private _iterating = 0;
	private _start: StartCallback<this>;
	private _stop: StopCallback | undefined = undefined;
	constructor(start: StartCallback<LazyDeferredSequence<T>>) {
		super();
		this._start = start;
	}
	override async *[Symbol.asyncIterator](): AsyncGenerator<T, void, void> {
		if (this._iterating < 1 && !this._stop) this._stop = this._start(this);
		this._iterating++;
		try {
			yield* super[Symbol.asyncIterator]();
		} finally {
			this._iterating--;
			if (this._iterating < 1 && this._stop) this._stop = void call(this._stop);
		}
	}
}
